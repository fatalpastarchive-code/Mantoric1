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
            {/* The Origin */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">The Origin</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed pl-14">
                <p>
                  Mantoric was born from a singular frustration: the modern digital landscape had become 
                  a cacophony of noise. In an era where every voice demands attention, genuine knowledge 
                  — the kind that transforms lives — was drowning beneath an endless tide of mediocrity.
                </p>
                <p>
                  We founded Mantoric to build something different: a <strong className="text-white">premium, noise-free knowledge institute</strong>. 
                  A place where the signal-to-noise ratio favors depth over breadth, where authors are 
                  rewarded for quality rather than clickbait, and where readers come seeking transformation, 
                  not just entertainment.
                </p>
                <p>
                  Our name derives from the ancient concept of a &ldquo;mantle&rdquo; — a symbol of authority 
                  and responsibility. To write on Mantoric is to don the mantle of a knowledge guardian, 
                  entrusted with the solemn duty of enriching human understanding.
                </p>
              </div>
            </section>

            {/* The Blueprint */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Target className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">The Blueprint</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed pl-14">
                <p>
                  We are executing a <strong className="text-white">14-month trajectory</strong> toward global scaling. 
                  Our roadmap is ambitious but deliberate:
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
                    <p className="text-sm text-zinc-300">Expansion — Cultural archive, forum launch, and community growth</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Phase 3</span>
                      <span className="text-xs text-zinc-600">Months 9-14</span>
                    </div>
                    <p className="text-sm text-zinc-300">Global Scale — Ambassador network, mobile applications, reaching millions</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ambassador System */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Ambassador System</h2>
              </div>
              <div className="space-y-4 text-zinc-400 leading-relaxed pl-14">
                <p>
                  We believe the best ideas spread through trusted voices. Our Ambassador System 
                  partners with English-speaking content creators globally — from emerging voices 
                  with <strong className="text-white">100 to 10,000 followers</strong> — to spread Mantoric&apos;s mission.
                </p>
                <p>
                  Ambassadors are more than promoters; they are curators of wisdom, entrusted to 
                  identify and elevate voices that deserve amplification. In exchange, they receive:
                </p>
                <ul className="space-y-2 mt-4 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Founder-tier badge and lifetime premium access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Revenue share from referred premium subscriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Direct access to the Mantoric founding team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Early access to new features and exclusive content</span>
                  </li>
                </ul>
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
