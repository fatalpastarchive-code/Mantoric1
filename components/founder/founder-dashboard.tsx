"use client"

import { useState } from "react"
import { Crown, Users, FileText, Heart, Sparkles, Activity, DollarSign, BarChart3, Shield, Trash2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardData {
  financialData: {
    potentialMonthlyRevenue: number
    totalIntents: number
    intentsByTier: {
      supporter: number
      patron: number
      guardian: number
      custom: number
    }
    recentIntents: any[]
    yesCount: number
    noCount: number
  }
  platformStats: {
    totalViews: number
    totalRespects: number
    activeUsers: number
    totalArticles: number
    totalUsers: number
    totalCulture: number
    totalForumPosts: number
    recentForumRespects: number
  }
  moderationStats: {
    deletedReviews: number
    deletedTopics: number
    totalDeleted: number
  }
  recentActivity: {
    type: string
    message: string
    timestamp: string
    userEmail: string
  }[]
}

interface FounderDashboardProps {
  data: DashboardData
}

const TABS = [
  { id: "overview" as const, label: "Overview", icon: BarChart3 },
  { id: "financial" as const, label: "Financial Intent", icon: DollarSign },
  { id: "activity" as const, label: "Activity Feed", icon: Activity },
  { id: "moderation" as const, label: "Caesar's Watch", icon: Shield },
]

export function FounderDashboard({ data }: FounderDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "financial" | "activity" | "moderation">("overview")

  const { financialData, platformStats, moderationStats, recentActivity } = data

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Crown className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Founder&apos;s Monitor</h1>
            <p className="text-sm text-zinc-500">Platform Intelligence Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "overview" && (
          <OverviewTab platformStats={platformStats} />
        )}

        {activeTab === "financial" && (
          <FinancialTab financialData={financialData} />
        )}

        {activeTab === "activity" && (
          <ActivityTab recentActivity={recentActivity} />
        )}

        {activeTab === "moderation" && (
          <ModerationTab moderationStats={moderationStats} platformStats={platformStats} />
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800/50">
        <p className="text-xs text-zinc-600 text-center">
          Mantoric Founder&apos;s Monitor • Authorized Access Only
        </p>
      </div>
    </div>
  )
}

function OverviewTab({ platformStats }: { platformStats: DashboardData["platformStats"] }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={platformStats.totalUsers.toLocaleString()} color="blue" />
        <StatCard icon={FileText} label="Published Articles" value={platformStats.totalArticles.toLocaleString()} color="emerald" />
        <StatCard icon={Sparkles} label="Cultural Reviews" value={platformStats.totalCulture.toLocaleString()} color="purple" />
        <StatCard icon={Heart} label="Total Respects" value={platformStats.totalRespects.toLocaleString()} color="rose" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Platform Views</p>
          <p className="text-2xl font-bold text-white">{platformStats.totalViews.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Active Users</p>
          <p className="text-2xl font-bold text-white">{platformStats.activeUsers.toLocaleString()}</p>
        </div>
      </div>
    </>
  )
}

function FinancialTab({ financialData }: { financialData: DashboardData["financialData"] }) {
  return (
    <>
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-950/30 to-zinc-950 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Potential Monthly Revenue</h3>
        </div>
        <p className="text-4xl font-bold text-violet-300 mb-2">
          ${financialData.potentialMonthlyRevenue.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-500">Based on {financialData.totalIntents} support intents</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TierCard label="Supporters ($3)" count={financialData.intentsByTier.supporter} color="emerald" />
        <TierCard label="Patrons ($10)" count={financialData.intentsByTier.patron} color="blue" />
        <TierCard label="Guardians ($50)" count={financialData.intentsByTier.guardian} color="violet" />
        <TierCard label="Custom" count={financialData.intentsByTier.custom} color="amber" />
      </div>

      {/* Support Intent (Yes/No) Stats */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Support Intent (Yes/No)</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-1">Yes</p>
            <p className="text-3xl font-black text-white">{financialData.yesCount || 0}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Users willing to contribute $10+</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
            <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">No</p>
            <p className="text-3xl font-black text-white">{financialData.noCount || 0}</p>
            <p className="text-[10px] text-zinc-500 mt-1">Users not interested currently</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50">
        <h4 className="text-sm font-bold text-white mb-4">Recent Intents</h4>
        <div className="space-y-2">
          {financialData.recentIntents.length === 0 ? (
            <p className="text-sm text-zinc-500">No support intents yet</p>
          ) : (
            financialData.recentIntents.map((intent: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">${intent.amount}</p>
                    <p className="text-xs text-zinc-500">{intent.category}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-600">
                  {new Date(intent.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function ActivityTab({ recentActivity }: { recentActivity: DashboardData["recentActivity"] }) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50">
      <h4 className="text-sm font-bold text-white mb-4">Recent Activity</h4>
      <div className="space-y-2">
        {recentActivity.length === 0 ? (
          <p className="text-sm text-zinc-500">No recent activity</p>
        ) : (
          recentActivity.map((activity: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/50">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300">{activity.message}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {activity.userEmail} • {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { 
  icon: typeof Users
  label: string
  value: string
  color: string 
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    purple: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  }

  return (
    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", colors[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}

function TierCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/10",
    blue: "border-blue-500/30 bg-blue-500/10",
    violet: "border-violet-500/30 bg-violet-500/10",
    amber: "border-amber-500/30 bg-amber-500/10",
  }

  return (
    <div className={cn("p-4 rounded-2xl border", colors[color])}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{count}</p>
    </div>
  )
}

function ModerationTab({ 
  moderationStats, 
  platformStats 
}: { 
  moderationStats: DashboardData["moderationStats"]
  platformStats: DashboardData["platformStats"]
}) {
  return (
    <div className="space-y-6">
      {/* Arena Pulse */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={MessageSquare} 
          label="Total Forum Posts" 
          value={platformStats.totalForumPosts?.toLocaleString() || "0"} 
          color="purple" 
        />
        <StatCard 
          icon={Heart} 
          label="Respects (24h)" 
          value={platformStats.recentForumRespects?.toLocaleString() || "0"} 
          color="rose" 
        />
      </div>

      {/* Caesar's Purge Stats */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-white">Caesar&apos;s Watch</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Deleted Reviews</p>
            <p className="text-2xl font-bold text-red-400">{moderationStats?.deletedReviews || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Deleted Topics</p>
            <p className="text-2xl font-bold text-red-400">{moderationStats?.deletedTopics || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Total Purged</p>
            <p className="text-2xl font-bold text-yellow-500">{moderationStats?.totalDeleted || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Moderation Activity */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/50">
        <h4 className="text-sm font-bold text-white mb-4">Recent Moderation</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-300">Content moderation is active</p>
              <p className="text-xs text-zinc-600">Caesar maintains order in the realm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
