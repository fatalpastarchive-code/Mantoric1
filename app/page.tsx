import { fetchInfiniteStream } from "@/lib/actions/stream-actions"
import { SLUG_TO_LABEL, CATEGORIES, CAESAR_CLERK_ID } from "@/lib/constants"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { InfiniteStream } from "@/components/feed/infinite-stream"
import { currentUser } from "@clerk/nextjs/server"
import { resolveMantoricRole } from "@/lib/auth/roles"
import { PenLine } from "lucide-react"
import Link from "next/link"

interface HomeProps {
  searchParams: Promise<{ category?: string }>
}

export const revalidate = 60

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const categorySlug = params.category
  const user = await currentUser()
  const role = await resolveMantoricRole(user)
  const canPublish = role === "Caesar" || role === "Senator"

  const streamItems = await fetchInfiniteStream(20)

  const activeCategory = CATEGORIES.find((c) => c.slug === categorySlug)

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory={categorySlug} />}
      mainContent={
        <div className="flex flex-col">
          {activeCategory && (
            <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/50">
              <div>
                <h1 className="text-3xl font-semibold tracking-tighter text-white">
                  {activeCategory.label}
                </h1>
              </div>
              <a
                href="/"
                className="rounded-2xl bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
              >
                ← All
              </a>
            </div>
          )}

          {!activeCategory && (
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-light tracking-tight text-white">Home</h1>
              {canPublish && (
                <Link
                  href="/publish"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-white/5 active:scale-95"
                >
                  <PenLine className="h-4 w-4" />
                  Publish
                </Link>
              )}
            </div>
          )}

          {streamItems.length === 0 ? (
            <div className="mx-4 my-8 flex flex-col items-center gap-6 rounded-3xl bg-white/5 p-16 text-center backdrop-blur-md">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                <svg className="h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  The stream is calm
                </p>
                <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto font-light">
                  Be the first to contribute wisdom to the archive.
                </p>
              </div>
            </div>
          ) : (
            <InfiniteStream initialItems={streamItems} />
          )}
        </div>
      }
      rightSidebar={<RightSidebar />}
    />
  )
}
