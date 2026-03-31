"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { supportIntents, platformStats } from "@/lib/db/collections"
import { revalidatePath } from "next/cache"

export interface SupportIntentInput {
  amount: string
  category: "Monthly" | "One-time"
}

export async function recordSupportIntent(data: SupportIntentInput): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  const user = await currentUser()
  
  try {
    const col = await supportIntents()
    
    await col.insertOne({
      userId: userId || undefined,
      amount: data.amount,
      category: data.category,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      createdAt: new Date(),
    } as any)

    return { success: true }
  } catch (error) {
    console.error("[recordSupportIntent] Error:", error)
    return { success: false, error: "Failed to record intent" }
  }
}

export async function getSupportIntents(): Promise<{ success: boolean; intents?: any[]; error?: string }> {
  try {
    const col = await supportIntents()
    
    const intents = await col
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    // Serialize
    const serialized = intents.map((intent: any) => ({
      _id: intent._id?.toString() || intent._id,
      userId: intent.userId,
      amount: intent.amount,
      category: intent.category,
      userEmail: intent.userEmail,
      createdAt: intent.createdAt instanceof Date 
        ? intent.createdAt.toISOString() 
        : intent.createdAt,
    }))

    return { success: true, intents: serialized }
  } catch (error) {
    console.error("[getSupportIntents] Error:", error)
    return { success: false, error: "Failed to fetch intents" }
  }
}

export async function getPlatformStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
  try {
    const col = await platformStats()
    
    let stats = await col.findOne({ _id: "main" })
    
    if (!stats) {
      // Initialize default stats
      await col.insertOne({
        _id: "main",
        totalViews: 0,
        totalRespects: 0,
        activeUsers: 0,
        updatedAt: new Date(),
      } as any)
      
      stats = await col.findOne({ _id: "main" })
    }

    return { 
      success: true, 
      stats: {
        totalViews: stats?.totalViews || 0,
        totalRespects: stats?.totalRespects || 0,
        activeUsers: stats?.activeUsers || 0,
        updatedAt: stats?.updatedAt instanceof Date 
          ? stats.updatedAt.toISOString() 
          : stats?.updatedAt,
      }
    }
  } catch (error) {
    console.error("[getPlatformStats] Error:", error)
    return { success: false, error: "Failed to fetch stats" }
  }
}

export async function incrementPlatformStat(field: "totalViews" | "totalRespects" | "activeUsers"): Promise<void> {
  try {
    const col = await platformStats()
    
    await col.updateOne(
      { _id: "main" },
      { 
        $inc: { [field]: 1 },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    )
  } catch (error) {
    console.error("[incrementPlatformStat] Error:", error)
  }
}
