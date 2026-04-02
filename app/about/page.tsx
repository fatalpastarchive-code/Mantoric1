import { Metadata } from "next"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { Crown, Target, Globe, BookOpen, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "About - Mantoric",
  description: "The story behind the world's premier knowledge sanctuary",
}

export default function AboutPage() {
  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
      mainContent={
        <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-6">
              <Crown className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              About Mantoric
            </h1>
            <p className="text-lg text-zinc-500">
              A sanctuary for timeless wisdom in a noisy world
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-16">
            {/* The Purpose */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">The Purpose</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed pl-14">
                <p>
                  <strong className="text-white">Archiving elite knowledge away from digital noise.</strong> The modern digital landscape has become 
                  a cacophony of noise. In an era where every voice demands attention, genuine knowledge 
                  — the kind that transforms lives — was drowning beneath an endless tide of mediocrity.
                </p>
                <p>
                  We founded Mantoric to build something different: a premium, noise-free knowledge institute. 
                  A place where the signal-to-noise ratio favors depth over breadth, where authors are 
                  rewarded for quality rather than clickbait, and where readers come seeking transformation, 
                  not just entertainment.
                </p>
              </div>
            </section>

            {/* The Hierarchy */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">The Hierarchy</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed pl-14">
                <p>
                  <strong className="text-white">Earning authority through verified respect and interactive axioms.</strong> On Mantoric, prestige cannot be 
                  bought or artificially inflated. It is earned exclusively through the contribution of 
                  elite knowledge and the respect it commands among peers.
                </p>
                <p>
                  Our system discards traditional &ldquo;likes&rdquo; and engagement farming. 
                  Instead, we utilize <strong className="text-white">Axioms</strong> to measure the weight and interactive resonance of an author&apos;s wisdom, and a strict <strong className="text-white">Respect System</strong> that ensures only the most profound insights rise to the top of our global archive.
                </p>
              </div>
            </section>

            {/* The Trajectory */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">The Trajectory</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed pl-14">
                <p>
                  <strong className="text-white">Our 14-month path toward a global physical and digital network.</strong> We are executing a 
                  deliberate trajectory to scale our sanctuary worldwide:
                </p>
                <div className="grid gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Phase 1</span>
                      <span className="text-xs text-zinc-600">Months 1-3</span>
                    </div>
                    <p className="text-sm text-zinc-300">Foundation — Core platform, respect system, and initial author cohort</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Phase 2</span>
                      <span className="text-xs text-zinc-600">Months 4-8</span>
                    </div>
                    <p className="text-sm text-zinc-300">Expansion — Cultural archive, interactive axioms, and community growth</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Phase 3</span>
                      <span className="text-xs text-zinc-600">Months 9-14</span>
                    </div>
                    <p className="text-sm text-zinc-300">Global Scale — Physical chapters, mobile applications, reaching millions</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Quote */}
            <div className="pt-8 border-t border-zinc-800/50">
              <blockquote className="text-center">
                <p className="text-xl italic text-zinc-400 mb-4">
                  &ldquo;In a world drowning in information, wisdom is the only currency that matters.&rdquo;
                </p>
                <cite className="text-sm text-zinc-600 not-italic">
                  — The Mantoric Council
                </cite>
              </blockquote>
            </div>
          </div>
        </div>
      }
    />
  )
}
