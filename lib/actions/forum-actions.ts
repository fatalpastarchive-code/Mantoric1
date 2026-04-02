"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { forumTopics, forumComments, users } from "@/lib/db/collections"
import type { ForumTopic, ForumComment, ForumTopicType } from "@/lib/db/schema"
import { ObjectId } from "mongodb"
import { CAESAR_CLERK_ID } from "@/lib/constants"

const RESPECT_COOLDOWN_DAYS = 7

// Admin function to give 100 respect to current user (Caesar only)
export async function adminGiveRespect(amount: number = 100) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }
    if (userId !== CAESAR_CLERK_ID) return { success: false, error: "Only Caesar can give respect" }

    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })
    if (!user) return { success: false, error: "User not found" }

    const newRespect = (user.respectPoints || 0) + amount
    await usersCol.updateOne(
      { clerkId: userId },
      {
        $set: {
          respectPoints: newRespect,
          updatedAt: new Date()
        }
      }
    )

    revalidatePath("/")
    revalidatePath("/forum")
    revalidatePath("/profile/[username]")
    return { success: true, respectPoints: newRespect }
  } catch (error) {
    console.error("[adminGiveRespect] Error:", error)
    return { success: false, error: "Failed to give respect" }
  }
}

interface RespectActionResult {
  success: boolean
  error?: string
  respectPoints?: number
  daysRemaining?: number
}

export async function handleRespectAction(targetUserId: string): Promise<RespectActionResult> {
  try {
    const { userId: currentUserId } = await auth()
    if (!currentUserId) return { success: false, error: "Unauthorized" }

    const isCaesar = currentUserId === CAESAR_CLERK_ID
    const usersCol = await users()
    const currentUser = await usersCol.findOne({ clerkId: currentUserId })
    if (!currentUser) return { success: false, error: "User not found" }

    const targetUser = await usersCol.findOne({ clerkId: targetUserId })
    if (!targetUser) return { success: false, error: "Target user not found" }
    if (currentUserId === targetUserId) return { success: false, error: "Cannot respect yourself" }

    // Caesar bypass - unlimited respect
    if (isCaesar) {
      const newReceiverRespect = (targetUser.respectPoints || 0) + 1
      await usersCol.updateOne(
        { clerkId: targetUserId },
        {
          $set: {
            respectPoints: newReceiverRespect,
            updatedAt: new Date()
          }
        }
      )
      revalidatePath("/forum")
      revalidatePath("/profile/[username]")
      return { success: true, respectPoints: newReceiverRespect }
    }

    // Check if user has respect to give (must have at least 1)
    const currentRespect = currentUser.respectPoints || 0
    if (currentRespect < 1) {
      return { success: false, error: "Insufficient respect points. Earn respect by receiving it from others or wait for weekly recharge." }
    }

    const lastRespectGiven = currentUser.lastRespectGivenAt || currentUser.lastRespectGivenDate
    if (lastRespectGiven) {
      const diffDays = (Date.now() - new Date(lastRespectGiven).getTime()) / (1000 * 3600 * 24)
      if (diffDays < RESPECT_COOLDOWN_DAYS) {
        return { success: false, error: `Respect Depleted - Recharges in ${Math.ceil(RESPECT_COOLDOWN_DAYS - diffDays)} days`, daysRemaining: Math.ceil(RESPECT_COOLDOWN_DAYS - diffDays) }
      }
    }

    // Transfer respect: -1 from giver, +1 to receiver
    const newGiverRespect = currentRespect - 1
    const newReceiverRespect = (targetUser.respectPoints || 0) + 1
    
    // Update giver (subtract 1 respect)
    await usersCol.updateOne(
      { clerkId: currentUserId }, 
      { 
        $set: { 
          respectPoints: newGiverRespect,
          lastRespectGivenAt: new Date(),
          lastRespectGivenDate: new Date(),
          updatedAt: new Date() 
        }
      }
    )
    
    // Update receiver (add 1 respect)
    await usersCol.updateOne(
      { clerkId: targetUserId }, 
      { 
        $set: { 
          respectPoints: newReceiverRespect,
          updatedAt: new Date() 
        }
      }
    )

    revalidatePath("/forum")
    revalidatePath("/profile/[username]")
    return { success: true, respectPoints: newReceiverRespect }
  } catch (error) {
    console.error("[handleRespectAction] Error:", error)
    return { success: false, error: "Internal server error" }
  }
}

interface CreateTopicInput {
  title: string
  content: string
  category: string
  tags?: string[]
  imageUrl?: string
  type: ForumTopicType
  relatedArticleId?: string
  relatedCultureId?: string
}

export async function createForumTopic(input: CreateTopicInput) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const isCaesar = userId === CAESAR_CLERK_ID
    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })
    if (!user) return { success: false, error: "User not found" }

    const role = user.role as any
    const canCreateTopic = isCaesar || ["CAESAR", "SENATOR", "LEGATE", "GLADIATOR", "CITIZEN"].includes(role)
    if (!canCreateTopic) return { success: false, error: "Only citizens and above can start discussions." }

    const topicsCol = await forumTopics()
    const newTopic = {
      title: input.title,
      content: input.content,
      authorId: userId,
      authorName: user.displayName || user.username || "Anonymous",
      category: input.category,
      tags: input.tags || [],
      imageUrl: input.imageUrl || "",
      type: input.type,
      relatedArticleId: input.relatedArticleId,
      relatedCultureId: input.relatedCultureId,
      views: 0, likesCount: 0, repliesCount: 0, isPinned: false, isLocked: false,
      createdAt: new Date(), updatedAt: new Date()
    }

    const result = await topicsCol.insertOne(newTopic as ForumTopic)
    revalidatePath("/forum")
    return { success: true, topic: { ...newTopic, _id: result.insertedId.toString() } }
  } catch (error) {
    console.error("[createForumTopic] Error:", error)
    return { success: false, error: "Failed to create topic" }
  }
}

export async function adminDeleteForumTopic(topicId: string) {
  try {
    const { userId } = await auth()
    if (!userId || userId !== CAESAR_CLERK_ID) return { success: false, error: "Only Caesar can purge noise" }

    const topicsCol = await forumTopics()
    const result = await topicsCol.deleteOne({ _id: new ObjectId(topicId) as any })
    if (result.deletedCount === 0) return { success: false, error: "Topic not found" }

    revalidatePath("/forum")
    return { success: true }
  } catch (error) {
    console.error("[adminDeleteForumTopic] Error:", error)
    return { success: false, error: "Failed to delete topic" }
  }
}

export async function createForumComment(input: { topicId: string; content: string }) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })
    if (!user) return { success: false, error: "User not found" }

    const topicsCol = await forumTopics()
    const topic = await topicsCol.findOne({ _id: new ObjectId(input.topicId) as any })
    if (!topic) return { success: false, error: "Topic not found" }
    if (topic.isLocked) return { success: false, error: "This discussion is locked" }

    const commentsCol = await forumComments()
    const newComment = {
      topicId: input.topicId, authorId: userId,
      authorName: user.displayName || user.username || "Anonymous",
      content: input.content, likesCount: 0, isEdited: false, isDeleted: false,
      createdAt: new Date(), updatedAt: new Date()
    }

    const result = await commentsCol.insertOne(newComment as ForumComment)
    await topicsCol.updateOne({ _id: new ObjectId(input.topicId) as any }, { $inc: { repliesCount: 1 }, $set: { updatedAt: new Date() }})
    revalidatePath(`/forum/topic/${input.topicId}`)
    return { success: true, comment: { ...newComment, _id: result.insertedId.toString() } }
  } catch (error) {
    console.error("[createForumComment] Error:", error)
    return { success: false, error: "Failed to post comment" }
  }
}

export async function deleteForumComment(commentId: string, topicId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const commentsCol = await forumComments()
    const comment = await commentsCol.findOne({ _id: new ObjectId(commentId) as any })
    if (!comment) return { success: false, error: "Comment not found" }

    const canDelete = userId === CAESAR_CLERK_ID || comment.authorId === userId
    if (!canDelete) return { success: false, error: "Unauthorized to delete this comment" }

    await commentsCol.updateOne({ _id: new ObjectId(commentId) as any }, { $set: { isDeleted: true, content: "[This comment has been purged]", updatedAt: new Date() }})
    await forumTopics().then(col => col.updateOne({ _id: new ObjectId(topicId) as any }, { $inc: { repliesCount: -1 }, $set: { updatedAt: new Date() }}))
    revalidatePath(`/forum/topic/${topicId}`)
    return { success: true }
  } catch (error) {
    console.error("[deleteForumComment] Error:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}

export async function getForumTopics(category?: string, limit: number = 20): Promise<{ success: boolean; topics?: any[]; error?: string }> {
  try {
    const col = await forumTopics()
    const query = category && category !== "all" ? { category: category.toLowerCase(), isLocked: false } : { isLocked: false }
    const rawTopics = await col.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(limit)
      .toArray()

    // Fetch author details for each topic
    const usersCol = await users()
    const topicsWithAuthors = await Promise.all(
      rawTopics.map(async (topic: any) => {
        const author = await usersCol.findOne({ clerkId: topic.authorId })
        return {
          ...topic,
          author: author ? {
            id: author._id?.toString() || author.clerkId,
            clerkId: author.clerkId,
            username: author.username,
            name: author.displayName || author.name || author.username || "Anonymous",
            avatar: author.avatar,
            rank: author.rank || "Newbie",
            xp: author.xp || 0,
            respectPoints: author.respectPoints || 0,
            bio: author.bio
          } : undefined
        }
      })
    )

    // Serialize MongoDB objects to plain objects (convert ObjectId to string)
    const topics = topicsWithAuthors.map((topic: any) => ({
      ...topic,
      _id: topic._id?.toString() || topic._id,
      createdAt: topic.createdAt instanceof Date ? topic.createdAt.toISOString() : topic.createdAt,
      updatedAt: topic.updatedAt instanceof Date ? topic.updatedAt.toISOString() : topic.updatedAt,
    }))

    return { success: true, topics }
  } catch (error) {
    console.error("[getForumTopics] Error:", error)
    return { success: false, error: "Failed to fetch discussions" }
  }
}

export async function getForumTopic(topicId: string): Promise<{ success: boolean; topic?: any; error?: string }> {
  try {
    const col = await forumTopics()
    const topic = await col.findOne({ _id: new ObjectId(topicId) as any })

    if (!topic) {
      return { success: false, error: "Topic not found" }
    }

    // Increment views
    await col.updateOne({ _id: new ObjectId(topicId) as any }, { $inc: { views: 1 } })

    return { success: true, topic }
  } catch (error) {
    console.error("[getForumTopic] Error:", error)
    return { success: false, error: "Failed to fetch discussion" }
  }
}

export async function getForumComments(topicId: string) {
  try {
    const commentsCol = await forumComments()
    const comments = await commentsCol.find({ topicId, isDeleted: false }).sort({ createdAt: 1 }).toArray()
    return { success: true, comments }
  } catch (error) {
    console.error("[getForumComments] Error:", error)
    return { success: false, error: "Failed to fetch comments" }
  }
}

export async function getTopAuthorities(limit: number = 5) {
  try {
    const usersCol = await users()
    const authorities = await usersCol.find({}).sort({ respectPoints: -1 }).limit(limit).project({ _id: 1, clerkId: 1, displayName: 1, username: 1, avatar: 1, respectPoints: 1, rank: 1, role: 1 }).toArray()
    return { success: true, authorities }
  } catch (error) {
    console.error("[getTopAuthorities] Error:", error)
    return { success: false, error: "Failed to fetch authorities" }
  }
}

export async function getUserRespectStatus() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })
    if (!user) return { success: false, error: "User not found" }

    const lastRespectGiven = user.lastRespectGivenAt || user.lastRespectGivenDate
    let canGiveRespect = true, daysRemaining = 0
    if (lastRespectGiven) {
      const diffDays = (Date.now() - new Date(lastRespectGiven).getTime()) / (1000 * 3600 * 24)
      if (diffDays < RESPECT_COOLDOWN_DAYS) {
        canGiveRespect = false
        daysRemaining = Math.ceil(RESPECT_COOLDOWN_DAYS - diffDays)
      }
    }
    return { success: true, canGiveRespect, daysRemaining, respectPoints: user.respectPoints || 0, respectCapacity: user.respectCapacity || 1 }
  } catch (error) {
    console.error("[getUserRespectStatus] Error:", error)
    return { success: false, error: "Failed to fetch respect status" }
  }
}

export async function getUserForumTopics(userId: string): Promise<{ success: boolean; topics?: any[]; error?: string }> {
  try {
    const col = await forumTopics()
    const rawTopics = await col.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .toArray()

    const topics = rawTopics.map((topic: any) => ({
      ...topic,
      _id: topic._id?.toString() || topic._id,
      createdAt: topic.createdAt instanceof Date ? topic.createdAt.toISOString() : topic.createdAt,
      updatedAt: topic.updatedAt instanceof Date ? topic.updatedAt.toISOString() : topic.updatedAt,
    }))

    return { success: true, topics }
  } catch (error) {
    console.error("[getUserForumTopics] Error:", error)
    return { success: false, error: "Failed to fetch user discussions" }
  }
}
