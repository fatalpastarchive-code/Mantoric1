import { Metadata } from "next"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { CultureFeed } from "@/components/cultural/culture-feed"

export const metadata: Metadata = {
  title: "Culture - Mantoric",
  description: "Cultural reviews, books, movies, and series",
}

export default function CulturePage() {
  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
      mainContent={
        <div className="min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800/50 px-4 py-3">
            <h1 className="text-xl font-bold text-white">Cultural Archive</h1>
            <p className="text-sm text-zinc-500">Books, cinema, and timeless wisdom</p>
          </div>

          {/* Feed */}
          <div className="p-4">
            <CultureFeed />
          </div>
        </div>
      }
    />
  )
}
