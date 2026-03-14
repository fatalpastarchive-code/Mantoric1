import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth, currentUser } from "@clerk/nextjs/server"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { PublishForm } from "@/components/publish/publish-form"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { resolveMantoricRole } from "@/lib/auth/roles"

export default async function PublishPage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const caesarId = process.env.CAESAR_CLERK_ID || CAESAR_CLERK_ID
  const isCaesar = userId === caesarId

  const clerkProfile = await currentUser()
  const role = await resolveMantoricRole(clerkProfile as any)
  const isAuthorized = isCaesar || role === "Senator" || role === "Praetor"

  if (!isAuthorized) {
    redirect("/")
  }

  const mainContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Publish Article
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only Caesar, Senators, and Praetors can publish articles to Mantoric.
        </p>
      </div>

      {/* Suspense boundary for useSearchParams in PublishForm */}
      <Suspense fallback={
        <div className="space-y-6 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm animate-pulse">
          <div className="h-10 w-full rounded bg-muted/40" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-10 w-full rounded bg-muted/40" />
            <div className="h-10 w-full rounded bg-muted/40" />
          </div>
          <div className="h-40 w-full rounded bg-muted/40" />
        </div>
      }>
        <PublishForm
          defaultAuthorName={
            clerkProfile?.fullName ||
            clerkProfile?.username ||
            clerkProfile?.primaryEmailAddress?.emailAddress ||
            "Unknown"
          }
        />
      </Suspense>
    </div>
  )

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar />}
      mainContent={mainContent}
      rightSidebar={<RightSidebar />}
    />
  )
}
