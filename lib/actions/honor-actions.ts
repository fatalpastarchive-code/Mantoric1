"use server"

import { users, articles, respects } from "@/lib/db/collections"
import { HonorMedal, UserRole, calculateUserLevel } from "@/lib/db/schema"

/**
 * Sweeps a user's accomplishments and updates their Honor/Badges automatically.
 * 1. ARENA_VETERAN: 50+ total respectPoints received.
 * 2. AXIOM_ARCHITECT: 5+ published articles, each with 10+ respectPoints.
 * 3. Level: Recalculates level based on current respectPoints.
 */
export async function syncUserHonor(clerkId: string) {
  const usersCol = await users()
  const articlesCol = await articles()
  
  const user = await usersCol.findOne({ clerkId })
  if (!user) return

  const currentBadges = new Set<HonorMedal>(user.badges || [])
  const respectPoints = user.respectPoints || 0
  
  // 1. ARENA_VETERAN
  if (respectPoints >= 50) {
    currentBadges.add("ARENA_VETERAN")
  }

  // 2. AXIOM_ARCHITECT
  const qualifyingArticlesCount = await articlesCol.countDocuments({
    authorId: clerkId,
    likesCount: { $gte: 10 }
  })
  
  if (qualifyingArticlesCount >= 5) {
    currentBadges.add("AXIOM_ARCHITECT")
  }

  // Calculate new level
  const newLevel = calculateUserLevel(respectPoints)

  // Update DB
  await usersCol.updateOne(
    { clerkId },
    { 
      $set: { 
        badges: Array.from(currentBadges),
        level: newLevel
      } 
    }
  )
}
