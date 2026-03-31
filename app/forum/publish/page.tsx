import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { ForumPublishForm } from "@/components/forum/forum-publish-form"
import { MessageSquare } from "lucide-react"

export default async function ForumPublishPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const mainContent = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <MessageSquare className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white md:text-3xl">
            Start Discussion
          </h1>
          <p className="text-sm text-zinc-500">
            Share your thoughts, questions, or theories with the Mantoric community.
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6 rounded-xl border border-zinc-800/50 bg-black p-6 animate-pulse">
          <div className="h-12 w-full rounded-lg bg-zinc-900/50" />
          <div className="h-11 w-full rounded-lg bg-zinc-900/50" />
          <div className="h-64 w-full rounded-lg bg-zinc-900/50" />
        </div>
      }>
        <ForumPublishForm />
      </Suspense>
    </div>
  )

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory="forum" />}
      mainContent={mainContent}
      rightSidebar={<RightSidebar showBestEntries={true} />}
    />
  )
}
