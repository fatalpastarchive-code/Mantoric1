import { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth } from "@clerk/nextjs/server"
import { getSupportIntents, getPlatformStats } from "@/lib/actions/support-intent-actions"
import { getUserCulturalReviews } from "@/lib/actions/cultural-review-actions"
import { getSupportAnalytics } from "@/lib/actions/support-actions"
import { articles, users, forumTopics } from "@/lib/db/collections"
import { FounderDashboard } from "@/components/founder/founder-dashboard"
import { CAESAR_CLERK_ID } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Founder's Monitor - Mantoric",
  description: "Admin dashboard for platform oversight",
}

export default async function FounderMonitorPage() {
  // Check founder access
  const { userId } = await auth()
  
  if (!userId || userId !== CAESAR_CLERK_ID) {
    redirect("/")
  }

  // Fetch all data in parallel
  const [
    supportIntentsResult,
    platformStatsResult,
    articlesCol,
    usersCol,
    forumCol,
    recentCultureResult,
    supportAnalytics
  ] = await Promise.all([
    getSupportIntents(),
    getPlatformStats(),
    articles(),
    users(),
    forumTopics(),
    getUserCulturalReviews(),
    getSupportAnalytics()
  ])

  // Calculate financial projections from support intents
  const supportIntents = supportIntentsResult.intents || []
  const monthlyIntents = supportIntents.filter(i => i.category === "Monthly")
  const oneTimeIntents = supportIntents.filter(i => i.category === "One-time")
  
  const potentialMonthlyRevenue = monthlyIntents.reduce((sum, intent) => {
    const amount = parseFloat(intent.amount) || 0
    return sum + amount
  }, 0)

  const totalIntents = supportIntents.length
  const intentsByTier = {
    supporter: monthlyIntents.filter(i => parseFloat(i.amount) === 3).length,
    patron: monthlyIntents.filter(i => parseFloat(i.amount) === 10).length,
    guardian: monthlyIntents.filter(i => parseFloat(i.amount) === 50).length,
    custom: monthlyIntents.filter(i => parseFloat(i.amount) !== 3 && parseFloat(i.amount) !== 10 && parseFloat(i.amount) !== 50).length,
  }

  // Platform stats
  const platformStats = platformStatsResult.stats || {
    totalViews: 0,
    totalRespects: 0,
    activeUsers: 0,
  }

  // Content counts
  const totalArticles = await articlesCol.countDocuments({ status: "published" })
  const totalUsers = await usersCol.countDocuments({})
  const totalCulture = recentCultureResult.reviews?.length || 0
  const totalForumPosts = await forumCol.countDocuments({})

  // Support Intent stats
  const { yesCount, noCount } = supportAnalytics

  return (
    <Suspense fallback={<div className="min-h-screen bg-black p-6"><div className="text-zinc-500">Loading...</div></div>}>
      <FounderDashboard
        data={{
          financialData: {
            potentialMonthlyRevenue,
            totalIntents,
            intentsByTier,
            recentIntents: monthlyIntents.slice(0, 10),
            yesCount,
            noCount
          },
          platformStats: {
            ...platformStats,
            totalArticles,
            totalUsers,
            totalCulture,
            totalForumPosts,
            recentForumRespects: 0,
          },
          moderationStats: {
            deletedReviews: 0,
            deletedTopics: 0,
            totalDeleted: 0,
          },
          recentActivity,
        }}
      />
    </Suspense>
  )
}
