import { Metadata } from "next"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { HelpCircle, Crown, Shield, Gem, Award, Sprout, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Help Center - Mantoric",
  description: "Understanding the Mantoric ecosystem",
}

export default function HelpCenterPage() {
  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
      mainContent={
        <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-6">
              <HelpCircle className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Help Center
            </h1>
            <p className="text-lg text-zinc-500">
              Understanding the Mantoric ecosystem
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-16">
            {/* Gamified Hierarchy */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">The Gamified Hierarchy</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed pl-14">
                <p>
                  Mantoric operates on a unique <strong className="text-white">Respect System</strong> that 
                  rewards meaningful contribution over mere activity. Unlike traditional platforms that 
                  prioritize volume, we value depth, authenticity, and genuine human connection.
                </p>
                
                <h3 className="text-lg font-semibold text-zinc-300 mt-8 mb-4">How Respect Works</h3>
                <div className="space-y-3">
                  <p>
                    <strong className="text-white">Respect is scarce.</strong> You can only give Respect 
                    to another user once every 30 days. This intentional scarcity ensures that when you 
                    receive Respect, it carries genuine weight.
                  </p>
                  <p>
                    <strong className="text-white">Respect flows upward.</strong> When you give Respect, 
                    you&apos;re not just clicking a button — you&apos;re acknowledging that someone&apos;s work 
                    enriched your understanding of the world.
                  </p>
                  <p>
                    <strong className="text-white">Respect compounds.</strong> The more Respect you accumulate, 
                    the higher your standing in the Mantoric hierarchy. But remember: Respect can only be 
                    earned through contribution, never purchased.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 mt-6">
                  <p className="text-sm text-zinc-500 italic">
                    &ldquo;The Respect System exists to maintain engagement value. When Respect is scarce, 
                    it means something. When it&apos;s abundant, it means nothing.&rdquo;
                  </p>
                </div>
              </div>
            </section>

            {/* Authority Badges */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Award className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Authority Badges</h2>
              </div>
              <div className="pl-14">
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Your badge reflects your accumulated Respect and determines your privileges 
                  within the ecosystem. Progress through the ranks:
                </p>

                <div className="space-y-4">
                  {/* Newbie */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                      <Sprout className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">Newbie</h3>
                        <span className="text-xs text-zinc-600">0-100 Respect</span>
                      </div>
                      <p className="text-sm text-zinc-500">Every journey begins here. Welcome to Mantoric.</p>
                    </div>
                  </div>

                  {/* Silver */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-zinc-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">Silver</h3>
                        <span className="text-xs text-zinc-600">101-500 Respect</span>
                      </div>
                      <p className="text-sm text-zinc-500">You&apos;ve found your voice. Your contributions are being noticed.</p>
                    </div>
                  </div>

                  {/* Gold */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                      <Gem className="h-6 w-6 text-amber-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">Gold</h3>
                        <span className="text-xs text-zinc-600">501-1500 Respect</span>
                      </div>
                      <p className="text-sm text-zinc-500">A respected voice in the community. Your wisdom guides others.</p>
                    </div>
                  </div>

                  {/* Diamond */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
                      <Award className="h-6 w-6 text-cyan-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">Diamond</h3>
                        <span className="text-xs text-zinc-600">1501-5000 Respect</span>
                      </div>
                      <p className="text-sm text-zinc-500">Among the most revered contributors. Your legacy is cemented.</p>
                    </div>
                  </div>

                  {/* Founder */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-zinc-950 border border-amber-500/20">
                    <div className="w-12 h-12 rounded-xl bg-amber-950/50 flex items-center justify-center">
                      <Crown className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-amber-400">Founder</h3>
                        <span className="text-xs text-amber-600/60">5000+ Respect</span>
                      </div>
                      <p className="text-sm text-zinc-500">The elite. Architects of the Mantoric vision.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
                  <p className="text-sm text-purple-300">
                    <strong>Special:</strong> The <span className="text-amber-400">Caesar</span> badge is 
                    reserved for the platform founder and grants unique administrative privileges.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Tips */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Quick Tips</h2>
              </div>
              <div className="pl-14 grid gap-4">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                  <h4 className="font-semibold text-white mb-2">Writing Treatises</h4>
                  <p className="text-sm text-zinc-500">
                    Long-form articles on Mantoric are called &ldquo;Treatises.&rdquo; Aim for depth, 
                    original insight, and actionable wisdom. Quality over quantity always wins.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                  <h4 className="font-semibold text-white mb-2">The Cultural Archive</h4>
                  <p className="text-sm text-zinc-500">
                    Document books, films, and series that shaped your thinking. Include a memorable 
                    quote and your analytical perspective.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                  <h4 className="font-semibold text-white mb-2">Giving Respect</h4>
                  <p className="text-sm text-zinc-500">
                    You can give Respect once per user every 30 days. Choose wisely — your Respect 
                    directly impacts their standing in the hierarchy.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <div className="pt-8 border-t border-zinc-800/50 text-center">
              <p className="text-zinc-500">
                Need more help? Contact the Council at{" "}
                <a href="mailto:support@mantoric.com" className="text-purple-400 hover:underline">
                  support@mantoric.com
                </a>
              </p>
            </div>
          </div>
        </div>
      }
    />
  )
}
