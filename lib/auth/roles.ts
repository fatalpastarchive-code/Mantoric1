import { clerkClient, type User as ClerkUser } from "@clerk/nextjs/server"
import { CAESAR_CLERK_ID } from "../constants"

export type MantoricRole = "Caesar" | "Senator" | "Praetor" | "Gladiator" | "Newbie"

/**
 * Resolves the Mantoric role for a Clerk user based on publicMetadata
 * and a single hard-coded Caesar user ID from env.
 *
 * - ONLY the user whose Clerk ID matches CAESAR_CLERK_ID can ever be "Caesar"
 * - If another user somehow has "Caesar" in publicMetadata, they are downgraded to "User"
 */
export async function resolveMantoricRole(
  clerkUser: ClerkUser | null,
): Promise<MantoricRole> {
  if (!clerkUser) return "Newbie"

  const caesarId = process.env.CAESAR_CLERK_ID || CAESAR_CLERK_ID
  const metadata = (clerkUser.publicMetadata || {}) as Record<string, unknown>
  const currentRole = (metadata.role as MantoricRole | undefined) ?? "Newbie"

  // If this is the configured Caesar user, ensure they are marked as Caesar
  if (caesarId && clerkUser.id === caesarId) {
    if (currentRole !== "Caesar") {
      const client = await clerkClient()
      await client.users.updateUser(clerkUser.id, {
        publicMetadata: {
          ...metadata,
          role: "Caesar",
        },
      })
    }
    return "Caesar"
  }

  // No other user is ever allowed to keep the Caesar role
  if (currentRole === "Caesar") {
    const client = await clerkClient()
    await client.users.updateUser(clerkUser.id, {
      publicMetadata: {
        ...metadata,
        role: "Newbie",
      },
    })
    return "Newbie"
  }

  // For all other cases, respect the stored role but clamp to known values
  const normalizedRole = currentRole.toString().toLowerCase()
  if (normalizedRole === "senator") return "Senator"
  if (normalizedRole === "praetor") return "Praetor"
  if (normalizedRole === "gladiator" || normalizedRole === "user") return "Gladiator"
  
  return "Newbie"
}

