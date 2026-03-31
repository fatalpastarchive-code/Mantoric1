"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

const FOUNDER_CLERK_ID = "user_2n7gH8QIkC1c9lQhKQJZL9E4t5k"

export async function checkFounderAccess() {
  const { userId } = await auth()
  const user = await currentUser()
  
  if (!userId || userId !== FOUNDER_CLERK_ID) {
    redirect("/")
  }
  
  return { userId, email: user?.emailAddresses?.[0]?.emailAddress }
}
