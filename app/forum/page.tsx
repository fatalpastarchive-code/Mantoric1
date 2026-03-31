import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { ForumFeed } from "@/components/forum/forum-feed"
import { getForumTopics } from "@/lib/actions/forum-actions"

export const metadata = {
  title: "Arena | Mantoric",
  description: "Debate. Discuss. Discover.",
}

export default async function ForumPage() {
  const topicsRes = await getForumTopics(undefined, 20)
  const initialTopics = topicsRes.success ? topicsRes.topics : []

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory="forum" />}
      mainContent={<ForumFeed initialTopics={initialTopics} />}
      rightSidebar={<RightSidebar showBestEntries={true} />}
    />
  )
}
