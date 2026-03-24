/**
 * Shared constants used across the Mantoric platform.
 */

export const CATEGORIES = [
  { id: "self-improvement", label: "Self-Improvement", slug: "self-improvement" },
  { id: "fitness", label: "Fitness & Health", slug: "fitness-health" },
  { id: "finance", label: "Finance & Career", slug: "finance-career" },
  { id: "relationships", label: "Relationships", slug: "relationships" },
  { id: "philosophy", label: "Philosophy", slug: "philosophy" },
  { id: "technology", label: "Technology", slug: "technology" },
  { id: "psychology", label: "Psychology", slug: "psychology" },
  { id: "lifestyle", label: "Lifestyle", slug: "lifestyle" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]
export type CategorySlug = (typeof CATEGORIES)[number]["slug"]

/** Map from URL slug → category label for DB queries */
export const SLUG_TO_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label])
)

/** Map from category label → URL slug */
export const LABEL_TO_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.label, c.slug])
)

/**
 * Caesar Clerk ID
 *
 * Primary source is the CAESAR_CLERK_ID value from .env(.local),
 * with a hardcoded fallback to preserve behaviour if the env var
 * is accidentally missing in some environments.
 */
export const CAESAR_CLERK_ID =
  process.env.CAESAR_CLERK_ID || "user_3AevbilPKVRe4cNoIEko4Qu5bHo"
