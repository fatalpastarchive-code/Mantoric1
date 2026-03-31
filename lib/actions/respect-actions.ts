"use server"

import { auth } from "@clerk/nextjs/server"
import { users, respects } from "@/lib/db/collections"
import { revalidatePath } from "next/cache"

export async function giveRespect(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  if (userId === targetUserId) {
    return { success: false, error: "Cannot respect yourself" }
  }

  try {
    const respectsCol = await respects()
    const usersCol = await users()

    // Get current user to check capacity and cooldown
    const currentUser = await usersCol.findOne({ clerkId: userId })
    if (!currentUser) {
      return { success: false, error: "User not found" }
    }

    const respectCapacity = currentUser.respectCapacity || 1
    const lastRespectGiven = currentUser.lastRespectGivenAt || currentUser.lastRespectGivenDate

    // Check 7-day cooldown
    if (lastRespectGiven) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      if (new Date(lastRespectGiven) > sevenDaysAgo) {
        const daysRemaining = Math.ceil((new Date(lastRespectGiven).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))
        return { success: false, error: `Respect energy recharging. ${daysRemaining} days remaining.` }
      }
    }

    // Check if already respected this user (prevent duplicate to same user)
    const existingRespect = await respectsCol.findOne({
      fromUserId: userId,
      toUserId: targetUserId
    })

    if (existingRespect) {
      return { success: false, error: "Already respected this user" }
    }

    // Create respect record
    await respectsCol.insertOne({
      fromUserId: userId,
      toUserId: targetUserId,
      createdAt: new Date()
    } as any)

    // Update recipient: increment respectPoints AND respectCapacity
    await usersCol.updateOne(
      { clerkId: targetUserId },
      { 
        $inc: { 
          respectPoints: 1,
          respectCapacity: 1 
        } 
      }
    )

    // Update sender: set lastRespectGivenAt
    await usersCol.updateOne(
      { clerkId: userId },
      { 
        $set: { 
          lastRespectGivenAt: new Date(),
          lastRespectGivenDate: new Date()
        } 
      }
    )

    revalidatePath("/profile")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("[giveRespect] Error:", error)
    return { success: false, error: "Failed to give respect" }
  }
}

export async function getRespectStatus(): Promise<{ 
  success: boolean; 
  respectCapacity?: number;
  respectPoints?: number;
  canGiveRespect?: boolean;
  daysRemaining?: number;
  error?: string 
}> {
  const { userId } = await auth()
  
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })
    
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const respectCapacity = user.respectCapacity || 1
    const respectPoints = user.respectPoints || 0
    const lastRespectGiven = user.lastRespectGivenAt || user.lastRespectGivenDate

    let canGiveRespect = true
    let daysRemaining = 0

    if (lastRespectGiven) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      if (new Date(lastRespectGiven) > sevenDaysAgo) {
        canGiveRespect = false
        daysRemaining = Math.ceil((new Date(lastRespectGiven).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))
      }
    }

    return { 
      success: true, 
      respectCapacity, 
      respectPoints,
      canGiveRespect,
      daysRemaining
    }
  } catch (error) {
    console.error("[getRespectStatus] Error:", error)
    return { success: false, error: "Failed to get respect status" }
  }
}
