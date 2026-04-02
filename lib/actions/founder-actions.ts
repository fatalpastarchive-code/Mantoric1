"use server"

import { auth } from "@clerk/nextjs/server"
import { articles, users, forumTopics, respects, culturalReviews } from "@/lib/db/collections"
import { revalidatePath } from "next/cache"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { ObjectId } from "mongodb"

async function checkAuth() {
  const { userId } = await auth()
  if (!userId || userId !== CAESAR_CLERK_ID) {
    // In a real app we'd also check user.publicMetadata.role
    throw new Error("Unauthorized")
  }
  return userId
}

export async function getRespectEconomyStats() {
  await checkAuth()
  
  const respectsCol = await respects()
  const usersCol = await users()
  
  // Total Respects
  const totalRespects = await respectsCol.countDocuments()
  
  // Top 5 Authorities
  const topAuthorities = await usersCol
    .find({})
    .sort({ respectPoints: -1 })
    .limit(5)
    .toArray()
  
  // Respect Velocity (last 24h)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recentRespects = await respectsCol.countDocuments({
    createdAt: { $gte: twentyFourHoursAgo }
  })
  
  return {
    totalRespects,
    topAuthorities: topAuthorities.map(u => ({
      name: u.displayName || u.username || "Unknown",
      respectPoints: u.respectPoints || 0,
      rank: u.rank || "Newbie"
    })),
    respectVelocity: recentRespects
  }
}

export async function getLegionStats() {
  await checkAuth()
  
  const usersCol = await users()
  
  const totalUsers = await usersCol.countDocuments()
  const activeElites = await usersCol.countDocuments({
    role: { $in: ["SENATOR", "GLADIATOR", "CAESAR"] }
  })
  
  return {
    totalUsers,
    activeElites
  }
}

export async function getRecentActivityFeed() {
  await checkAuth()
  
  const articleCol = await articles()
  const forumCol = await forumTopics()
  const cultureCol = await culturalReviews()
  
  const [recentArticles, recentTopics, recentCulture] = await Promise.all([
    articleCol.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    forumCol.find({}).sort({ createdAt: -1 }).limit(10).toArray(),
    cultureCol.find({}).sort({ createdAt: -1 }).limit(10).toArray()
  ])
  
  const feed = [
    ...recentArticles.map(a => ({
      id: a._id.toString(),
      type: "ARTICLE",
      title: a.title,
      author: a.authorName || "Unknown",
      createdAt: a.createdAt
    })),
    ...recentTopics.map(t => ({
      id: t._id.toString(),
      type: "FORUM",
      title: t.title,
      author: t.authorName || "Unknown",
      createdAt: t.createdAt
    })),
    ...recentCulture.map(c => ({
      id: c._id.toString(),
      type: "CULTURE",
      title: c.title,
      author: c.author?.name || "Unknown",
      createdAt: c.createdAt
    }))
  ]
  
  return feed
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
}

export async function deleteContentById(id: string, type: "ARTICLE" | "FORUM" | "CULTURE") {
  await checkAuth()
  
  try {
    if (type === "ARTICLE") {
      const col = await articles()
      await col.deleteOne({ _id: new ObjectId(id) as any })
    } else if (type === "FORUM") {
      const col = await forumTopics()
      await col.deleteOne({ _id: new ObjectId(id) as any })
    } else if (type === "CULTURE") {
      const col = await culturalReviews()
      await col.deleteOne({ _id: new ObjectId(id) as any })
    }
    
    revalidatePath("/founder/monitor")
    return { success: true }
  } catch (error) {
    console.error("Delete error:", error)
    return { success: false, error: "Failed to delete" }
  }
}
export async function getUsersManageList() {
  await checkAuth()
  const col = await users()
  const allUsers = await col.find({}).sort({ createdAt: -1 }).limit(100).toArray()
  
  return allUsers.map(u => ({
    clerkId: u.clerkId,
    username: u.username || u.name || "Unknown",
    email: u.email,
    respectPoints: u.respectPoints || 0,
    isPostBanned: u.isPostBanned || false,
    role: u.role || "CITIZEN",
    badges: u.badges || [],
    createdAt: u.createdAt
  }))
}

export async function updateUserRole(clerkId: string, role: string) {
  await checkAuth()
  const col = await users()
  await col.updateOne({ clerkId }, { $set: { role: role.toUpperCase() as any } })
  revalidatePath("/founder/monitor")
  return { success: true }
}

export async function updateUserBadges(clerkId: string, badges: string[]) {
  await checkAuth()
  const col = await users()
  await col.updateOne({ clerkId }, { $set: { badges: badges as any } })
  revalidatePath("/founder/monitor")
  return { success: true }
}

export async function updateUserRespect(clerkId: string, points: number) {
  await checkAuth()
  const col = await users()
  await col.updateOne({ clerkId }, { $set: { respectPoints: points } })
  revalidatePath("/founder/monitor")
  return { success: true }
}

export async function toggleUserPostBan(clerkId: string, isBanned: boolean) {
  await checkAuth()
  const col = await users()
  await col.updateOne({ clerkId }, { $set: { isPostBanned: isBanned } })
  revalidatePath("/founder/monitor")
  return { success: true }
}

export async function purgeUser(clerkId: string) {
  await checkAuth()
  const col = await users()
  await col.deleteOne({ clerkId })
  revalidatePath("/founder/monitor")
  return { success: true }
}

export async function getImperialStats() {
  await checkAuth()
  const usersCol = await users()
  
  const totalUsers = await usersCol.countDocuments()
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const activeUsers24h = await usersCol.countDocuments({
    lastActiveAt: { $gte: twentyFourHoursAgo }
  })

  // Simulated average daily users
  const avgDailyUsers = Math.round(activeUsers24h * 0.85)
  
  return {
    totalUsers,
    activeUsers24h,
    avgDailyUsers
  }
}
