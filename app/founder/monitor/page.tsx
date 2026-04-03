import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { 
  getSupportIntentAggregates, 
} from "@/lib/actions/support-intent-actions"
import { 
  getImperialStats,
  getUsersManageList,
  getRecentActivityFeed 
} from "@/lib/actions/founder-actions"
import { FounderDashboard } from "@/components/founder/founder-dashboard"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { resolveMantoricRole } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Imperial Command - Mantoric",
  description: "Sovereign Monitoring Protocol",
}

export default async function FounderMonitorPage() {
  const { userId } = await auth()
  const clerkUser = await currentUser()
  const role = await resolveMantoricRole(clerkUser)
  
  // Strict Access: Caesar or Admin only
  if (!userId || (userId !== CAESAR_CLERK_ID && role !== "Caesar")) {
    return notFound()
  }

  // Fetch parallelized imperial data
  const [
    financialAggs,
    imperialStats,
    usersList,
    recentActivity,
  ] = await Promise.all([
    getSupportIntentAggregates(),
    getImperialStats(),
    getUsersManageList(),
    getRecentActivityFeed(),
  ])

  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center font-black uppercase text-zinc-900 tracking-[1em] text-xs">Initializing Imperial Command...</div>}>
      <FounderDashboard
        data={{
          imperial: {
            totalUsers: imperialStats.totalUsers,
            totalAxioms: imperialStats.totalAxioms || 0,
            active24h: imperialStats.activeUsers24h,
            avgDaily: imperialStats.avgDailyUsers,
          },
          financial: {
            avgIntent: financialAggs.averageIntent,
            totalProjected: financialAggs.totalCommitted,
            growthData: financialAggs.growthData,
          },
          users: usersList,
          content: {
            counts: { articles: 0, forum: 0, culture: 0 }, // Simplified for the management view
            feed: recentActivity,
          }
        }}
      />
    </Suspense>
  )
}
