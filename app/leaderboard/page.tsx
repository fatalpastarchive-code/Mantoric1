import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { LeaderboardPage } from "@/components/leaderboard/leaderboard-page"

export default function Leaderboard() {
  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar />}
      mainContent={<LeaderboardPage />}
      rightSidebar={<RightSidebar />}
    />
  )
}
