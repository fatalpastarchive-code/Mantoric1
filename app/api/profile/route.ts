import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { users } from "@/lib/db/collections"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const [clerkUser, usersCol] = await Promise.all([
    clerkClient.users.getUser(userId),
    users(),
  ])

  const dbUser = await usersCol.findOne({ clerkId: userId })

  const bannerUrl =
    (clerkUser.publicMetadata?.bannerUrl as string | undefined) ||
    dbUser?.bannerUrl ||
    ""

  const bio = dbUser?.bio || ""

  return NextResponse.json({
    bio,
    bannerUrl,
    avatar: clerkUser.imageUrl,
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as {
    bio?: string
    bannerUrl?: string
  } | null

  if (!body) {
    return new NextResponse("Invalid body", { status: 400 })
  }

  const { bio = "", bannerUrl = "" } = body

  const [clerkUser, usersCol] = await Promise.all([
    clerkClient.users.getUser(userId),
    users(),
  ])

  const now = new Date()

  await usersCol.updateOne(
    { clerkId: userId },
    {
      $set: {
        bio,
        // keep a copy in Mongo for server-side rendering / fallbacks
        bannerUrl,
        updatedAt: now,
      },
    },
    { upsert: false },
  )

  const existingMetadata = (clerkUser.publicMetadata || {}) as Record<string, unknown>

  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      ...existingMetadata,
      bannerUrl: bannerUrl || undefined,
    },
  })

  return NextResponse.json({
    bio,
    bannerUrl,
    avatar: clerkUser.imageUrl,
  })
}

