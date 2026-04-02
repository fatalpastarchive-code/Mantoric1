"use client"

import { useTransition, useState } from "react"
import { 
  Crown, Users, FileText, Heart, Sparkles, Activity, 
  DollarSign, BarChart3, Shield, Trash2, TrendingUp, 
  Layers, MessageSquare, BookOpen, AlertTriangle,
  Ban, CheckCircle2, UserX, PenTool, Search
} from "lucide-react"
import { cn, formatMetric } from "@/lib/utils"
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts"
import { 
  deleteContentById, 
  updateUserRespect, 
  toggleUserPostBan, 
  purgeUser,
  updateUserRole,
  updateUserBadges
} from "@/lib/actions/founder-actions"
import { RankBadge } from "@/components/ui/rank-badge"
import type { HonorMedal, UserRole } from "@/lib/db/schema"
import { toast } from "sonner"

interface DashboardData {
  imperial: {
    totalUsers: number
    active24h: number
    avgDaily: number
  }
  financial: {
    avgIntent: number
    totalProjected: number
    growthData: { month: string; total: number; count: number }[]
  }
  users: {
    clerkId: string
    username: string
    email: string
    respectPoints: number
    isPostBanned: boolean
    role: UserRole
    badges: HonorMedal[]
  }[]
  content: {
    counts: { articles: number, forum: number, culture: number }
    feed: any[]
  }
}

export function FounderDashboard({ data }: { data: DashboardData }) {
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = data.users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRespectEdit = async (clerkId: string, current: number) => {
    const newVal = prompt("Enter new respect points:", String(current))
    if (newVal === null) return
    const points = parseInt(newVal)
    if (isNaN(points)) return

    startTransition(async () => {
      const res = await updateUserRespect(clerkId, points)
      if (res.success) toast.success("Respect adjusted")
    })
  }

  const handleToggleBan = async (clerkId: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleUserPostBan(clerkId, !current)
      if (res.success) toast.success(current ? "Ban lifted" : "User silenced")
    })
  }

  const handlePurgeUser = async (clerkId: string, username: string) => {
    if (!confirm(`Are you sure you want to absolute purge ${username}? This is Caesar's Right.`)) return
    startTransition(async () => {
      const res = await purgeUser(clerkId)
      if (res.success) toast.success("User erased from history")
    })
  }

  const handleRoleChange = async (clerkId: string, role: string) => {
    startTransition(async () => {
      const res = await updateUserRole(clerkId, role)
      if (res.success) toast.success(`User promoted to ${role}`)
    })
  }

  const handleBadgeToggle = async (clerkId: string, currentBadges: HonorMedal[], badge: HonorMedal) => {
    const newBadges = currentBadges.includes(badge)
      ? currentBadges.filter(b => b !== badge)
      : [...currentBadges, badge]
    
    startTransition(async () => {
      const res = await updateUserBadges(clerkId, newBadges)
      if (res.success) toast.success("Honor updated")
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* Imperial Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center border border-violet-400/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-1" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              Imperial Command
            </h1>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Sovereign Monitoring Protocol</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Oracle Status: Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Imperial Stats Card */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
           <StatCard label="Total Legion" value={data.imperial.totalUsers} sub="Total Registered" icon={Users} color="violet" />
           <StatCard label="Active 24h" value={data.imperial.active24h} sub="Live Movements" icon={Activity} color="emerald" />
           <StatCard label="Daily Avg" value={data.imperial.avgDaily} sub="Retention Rate" icon={TrendingUp} color="blue" />
        </div>

        {/* Financial Authority Card */}
        <div className="bg-[#050505] rounded-3xl p-6 border border-zinc-900 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Financial Projection</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
           </div>
           <div>
              <p className="text-3xl font-black mb-1">${formatMetric(data.financial.totalProjected)}</p>
              <p className="text-[10px] text-zinc-600 font-medium">Avg Intent: ${data.financial.avgIntent.toFixed(2)}</p>
           </div>
           <div className="h-12 mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.financial.growthData}>
                  <Area type="monotone" dataKey="total" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* User Management Module */}
      <div className="bg-[#050505] rounded-[2rem] border border-zinc-900 overflow-hidden mb-12">
        <div className="p-8 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/30">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-violet-500" />
            <h2 className="text-xl font-bold tracking-tight uppercase">Legion Management</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search by Username/Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 transition-all w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Username</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Hierarchy</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Honor</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredUsers.map((user) => (
                <tr key={user.clerkId} className="hover:bg-zinc-900/10 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          <RankBadge role={user.role} size="sm" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{user.username}</span>
                        <div className="flex items-center gap-2 group/respect cursor-pointer" onClick={() => handleRespectEdit(user.clerkId, user.respectPoints)} title="Click to edit respect">
                          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest group-hover/respect:text-emerald-400 transition-colors">respect: {user.respectPoints}</span>
                          <PenTool className="h-3 w-3 text-zinc-800 group-hover/respect:text-emerald-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs text-zinc-500">{user.email}</td>
                  <td className="px-8 py-5">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.clerkId, e.target.value)}
                      className="bg-black border border-zinc-800 text-[10px] uppercase font-black tracking-widest rounded-lg px-2 py-1 outline-none focus:border-violet-500"
                    >
                      {["CAESAR", "SENATOR", "LEGATE", "GLADIATOR", "CITIZEN"].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(["EARLY_SUPPORTER", "AXIOM_ARCHITECT", "ARENA_VETERAN", "PURVEYOR_OF_WISDOM", "SILENCE_BREAKER"] as HonorMedal[]).map(b => (
                        <button
                          key={b}
                          onClick={() => handleBadgeToggle(user.clerkId, user.badges, b)}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all",
                            user.badges.includes(b)
                              ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                              : "bg-zinc-950 text-zinc-600 border-zinc-900 opacity-60"
                          )}
                        >
                          {b.split('_')[0]}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleToggleBan(user.clerkId, user.isPostBanned)}
                        className={cn(
                          "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all",
                          user.isPostBanned ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                        )}
                      >
                        {user.isPostBanned ? "Unsilent" : "Silence"}
                      </button>
                      <button 
                        onClick={() => handlePurgeUser(user.clerkId, user.username)}
                        className="p-1 rounded bg-zinc-900 text-zinc-600 hover:text-red-500 transition-all"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hierarchy Dashboard Mobile View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map(user => (
          <div key={user.clerkId} className="bg-zinc-950/50 rounded-3xl p-6 border border-zinc-900">
             <div className="flex items-center gap-4 mb-4">
               <div className="relative h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <span className="text-sm font-black text-violet-400">{user.username[0].toUpperCase()}</span>
                  <div className="absolute -bottom-1 -right-1">
                    <RankBadge role={user.role} size="sm" />
                  </div>
               </div>
               <div>
                  <h3 className="font-black text-lg leading-none">{user.username}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest"> {user.email} </p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-2xl bg-black border border-zinc-900">
                   <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Hierarchy</p>
                   <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.clerkId, e.target.value)}
                      className="w-full bg-transparent text-[10px] uppercase font-black outline-none"
                    >
                      {["CAESAR", "SENATOR", "LEGATE", "GLADIATOR", "CITIZEN"].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                </div>
                <button onClick={() => handleRespectEdit(user.clerkId, user.respectPoints)} className="p-3 rounded-2xl bg-black border border-zinc-900 text-left hover:border-emerald-500/50 transition-colors">
                   <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Points</p>
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-black">{user.respectPoints}</span>
                     <PenTool className="h-3 w-3 text-zinc-700" />
                   </div>
                </button>
             </div>
             <div className="flex flex-wrap gap-1 mb-6">
                {(["EARLY_SUPPORTER", "AXIOM_ARCHITECT", "ARENA_VETERAN", "PURVEYOR_OF_WISDOM", "SILENCE_BREAKER"] as HonorMedal[]).map(b => (
                  <button
                    key={b}
                    onClick={() => handleBadgeToggle(user.clerkId, user.badges, b)}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[8px] font-black uppercase border",
                      user.badges.includes(b) ? "bg-violet-500/10 text-violet-400 border-violet-500/30" : "bg-black text-zinc-700 border-zinc-900"
                    )}
                  >
                    {b.split('_')[0]}
                  </button>
                ))}
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => handleToggleBan(user.clerkId, user.isPostBanned)}
                  className={cn("flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", user.isPostBanned ? "bg-emerald-500/80 text-white" : "bg-red-500/80 text-white")}
                >
                   {user.isPostBanned ? "Lift Silence" : "Silence User"}
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="text-center text-[10px] text-zinc-800 font-bold uppercase tracking-[0.5em] py-8">
        Imperial Registry • Secure Line • Mantoric OS V4.0
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, color }: any) {
  const colors: any = {
    violet: "text-violet-400 bg-violet-400/5 border-violet-400/10",
    emerald: "text-emerald-400 bg-emerald-400/5 border-emerald-400/10",
    blue: "text-blue-400 bg-blue-400/5 border-blue-400/10",
  }

  return (
    <div className="bg-[#050505] rounded-3xl p-6 border border-zinc-900">
       <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
          <div className={cn("p-2 rounded-xl", colors[color])}>
            <Icon className="h-4 w-4" />
          </div>
       </div>
       <p className="text-4xl font-black tracking-tighter mb-1">{formatMetric(value)}</p>
       <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{sub}</p>
    </div>
  )
}
