"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { supportIntents, platformStats, users, activityLogs } from "@/lib/db/collections"
import { revalidatePath } from "next/cache"

export interface SupportIntentInput {
  amount: string
  category: "Monthly" | "One-time"
  frequency?: "Monthly" | "One-time"
  tier?: "Supporter" | "Scholar" | "Patron" | "Founder's Circle"
}

function getTierFromAmount(amount: number): "Supporter" | "Scholar" | "Patron" | "Founder's Circle" {
  if (amount <= 20) return "Supporter"
  if (amount <= 100) return "Scholar"
  if (amount <= 500) return "Patron"
  return "Founder's Circle"
}

export async function recordSupportIntent(data: SupportIntentInput): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  const user = await currentUser()
  
  try {
    const col = await supportIntents()
    const amountValue = parseFloat(data.amount) || 0
    
    await col.insertOne({
      userId: userId || undefined,
      amount: data.amount,
      amountValue,
      category: data.category,
      frequency: data.frequency || data.category,
      tier: data.tier || getTierFromAmount(amountValue),
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
      amountValue: intent.amountValue || parseFloat(intent.amount) || 0,
      category: intent.category,
      frequency: intent.frequency || intent.category,
      tier: intent.tier || getTierFromAmount(parseFloat(intent.amount) || 0),
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

// Aggregation functions for the Founder Monitor
export async function getSupportIntentAggregates(): Promise<{
  totalCommitted: number
  monthlyProjected: number
  averageIntent: number
  totalIntents: number
  monthlyCount: number
  oneTimeCount: number
  tierBreakdown: Record<string, number>
  growthData: { month: string; total: number; count: number }[]
}> {
  try {
    const col = await supportIntents()
    const allIntents = await col.find({}).toArray()

    let totalCommitted = 0
    let monthlyProjected = 0
    let monthlyCount = 0
    let oneTimeCount = 0
    const tierBreakdown: Record<string, number> = {
      "Supporter": 0,
      "Scholar": 0,
      "Patron": 0,
      "Founder's Circle": 0,
    }

    // Group by month for growth chart
    const monthMap = new Map<string, { total: number; count: number }>()

    for (const intent of allIntents) {
      const amount = intent.amountValue || parseFloat(intent.amount) || 0
      totalCommitted += amount

      const freq = intent.frequency || intent.category
      if (freq === "Monthly") {
        monthlyProjected += amount
        monthlyCount++
      } else {
        oneTimeCount++
      }

      const tier = intent.tier || getTierFromAmount(amount)
      tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1

      // Group by month
      const date = intent.createdAt instanceof Date ? intent.createdAt : new Date(intent.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const existing = monthMap.get(monthKey) || { total: 0, count: 0 }
      monthMap.set(monthKey, { total: existing.total + amount, count: existing.count + 1 })
    }

    const totalIntents = allIntents.length
    const averageIntent = totalIntents > 0 ? totalCommitted / totalIntents : 0

    // Sort months chronologically and create growth data
    const growthData = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, total: data.total, count: data.count }))

    return {
      totalCommitted,
      monthlyProjected,
      averageIntent,
      totalIntents,
      monthlyCount,
      oneTimeCount,
      tierBreakdown,
      growthData,
    }
  } catch (error) {
    console.error("[getSupportIntentAggregates] Error:", error)
    return {
      totalCommitted: 0,
      monthlyProjected: 0,
      averageIntent: 0,
      totalIntents: 0,
      monthlyCount: 0,
      oneTimeCount: 0,
      tierBreakdown: {},
      growthData: [],
    }
  }
}

export async function getPlatformStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
  try {
    const colRaw = await platformStats()
    const usersCol = await users()
    const logsCol = await activityLogs()
    
    let stats = await colRaw.findOne({ _id: "main" })
    
    // Imperial Pulse: Stats from both databases
    const totalUsers = await usersCol.countDocuments({})
    
    // Sum total axioms (XP awarded in forum logs)
    const axiomAgg = await logsCol.aggregate([
      { $group: { _id: null, total: { $sum: "$xpAwarded" } } }
    ]).toArray()
    const totalAxioms = axiomAgg[0]?.total || 0
    
    if (!stats) {
      // Initialize default stats
      await colRaw.insertOne({
        _id: "main",
        totalViews: 0,
        totalRespects: 0,
        activeUsers: 0,
        updatedAt: new Date(),
      } as any)
      
      stats = await colRaw.findOne({ _id: "main" })
    }

    return { 
      success: true, 
      stats: {
        totalViews: stats?.totalViews || 0,
        totalRespects: stats?.totalRespects || 0,
        activeUsers: stats?.activeUsers || 0,
        totalUsers,
        totalAxioms,
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
export async function recordDonationInteraction(choice: 'YES' | 'NO', amount?: number): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  const user = await currentUser()
  
  if (!userId) return { success: false, error: "Unauthorized" }

  try {
    const usersCol = await users()
    const intentsCol = await supportIntents()
    const email = user?.emailAddresses?.[0]?.emailAddress

    // 1. Update User model
    const updateData: any = {
      hasInteractedWithDonation: true,
      donationChoice: choice,
      donationIntentAmount: amount || 0,
    }

    // Reward with badge if they said YES
    if (choice === 'YES') {
      await usersCol.updateOne(
        { clerkId: userId },
        { 
          $set: updateData,
          $addToSet: { badges: "EARLY_SUPPORTER" as any }
        }
      )

      // 2. Add to SupportIntent collection
      await intentsCol.insertOne({
        userId,
        amount: String(amount || 0),
        amountValue: amount || 0,
        category: "One-time",
        frequency: "One-time",
        userEmail: email,
        createdAt: new Date(),
        tier: getTierFromAmount(amount || 0)
      } as any)
      
      // Sync other honors too
      const { syncUserHonor } = await import("@/lib/actions/honor-actions")
      await syncUserHonor(userId)
    } else {
      await usersCol.updateOne(
        { clerkId: userId },
        { $set: updateData }
      )
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("[recordDonationInteraction] Error:", error)
    return { success: false, error: "Failed to record interaction" }
  }
}

export async function getBrotherhoodStatus(): Promise<{ hasInteracted: boolean; isPostBanned: boolean }> {
  const { userId } = await auth()
  if (!userId) return { hasInteracted: true, isPostBanned: false } // Don't show to guests

  try {
    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })
    
    return {
      hasInteracted: user?.hasInteractedWithDonation || false,
      isPostBanned: user?.isPostBanned || false
    }
  } catch (error) {
    return { hasInteracted: true, isPostBanned: false }
  }
}
