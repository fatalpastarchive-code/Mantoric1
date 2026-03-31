"use server"

import { supportAnalytics } from "@/lib/db/collections"

export async function incrementSupportViews(): Promise<void> {
  try {
    const col = await supportAnalytics()
    
    // Get or create the analytics document (using a fixed id)
    const docId = "main"
    
    await col.updateOne(
      { _id: docId },
      { 
        $inc: { views: 1 },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    )
  } catch (error) {
    console.error("[incrementSupportViews] Error:", error)
  }
}

export async function incrementSupportClicks(): Promise<void> {
  try {
    const col = await supportAnalytics()
    
    const docId = "main"
    
    await col.updateOne(
      { _id: docId },
      { 
        $inc: { clicks: 1 },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    )
  } catch (error) {
    console.error("[incrementSupportClicks] Error:", error)
  }
}

export async function incrementSupportYes(): Promise<void> {
  try {
    const col = await supportAnalytics()
    await col.updateOne(
      { _id: "main" },
      { $inc: { yesCount: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true }
    )
  } catch (error) {
    console.error("[incrementSupportYes] Error:", error)
  }
}

export async function incrementSupportNo(): Promise<void> {
  try {
    const col = await supportAnalytics()
    await col.updateOne(
      { _id: "main" },
      { $inc: { noCount: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true }
    )
  } catch (error) {
    console.error("[incrementSupportNo] Error:", error)
  }
}

export async function getSupportAnalytics(): Promise<{ views: number; clicks: number; yesCount: number; noCount: number }> {
  try {
    const col = await supportAnalytics()
    
    const doc = await col.findOne({ _id: "main" })
    
    if (!doc) {
      return { views: 0, clicks: 0, yesCount: 0, noCount: 0 }
    }
    
    return { 
      views: doc.views || 0, 
      clicks: doc.clicks || 0,
      yesCount: doc.yesCount || 0,
      noCount: doc.noCount || 0
    }
  } catch (error) {
    console.error("[getSupportAnalytics] Error:", error)
    return { views: 0, clicks: 0, yesCount: 0, noCount: 0 }
  }
}
