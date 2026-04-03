/**
 * MongoDB Singleton Client (clientPromise pattern)
 *
 * Uses a global, cached connection promise in development so that
 * Next.js hot reload does not create multiple clients which can
 * lead to stale "not primary" connections.
 */
import { MongoClient, type Db } from "mongodb"

function normalizeMongoUri(uri: string): string {
  let url = uri.trim()
  // Standard connection strings (shards with ports) should NOT be auto-upgraded to SRV.
  // We only ensure the URI is trimmed and has basic params.

  // Ensure retryable writes and majority write concern for better failover handling
  if (!url.includes("retryWrites=")) {
    const separator = url.includes("?") ? "&" : "?"
    url += `${separator}retryWrites=true&w=majority`
  }

  return url
}

// Extend the global type so TypeScript doesn't complain
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const rawMongoUri = process.env.MAIN_DATABASE_URL || process.env.MONGODB_URI
  const MONGODB_URI = rawMongoUri ? normalizeMongoUri(rawMongoUri) : undefined

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MAIN_DATABASE_URL environment variable in .env.local"
    )
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI)
      globalThis._mongoClientPromise = client.connect()
    }
    return globalThis._mongoClientPromise
  } else {
    const client = new MongoClient(MONGODB_URI)
    return client.connect()
  }
}

/**
 * Returns the default database instance.
 * Call this in API routes / server components:
 *
 *   const db = await getDb()
 *   const users = db.collection("users")
 */
export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db() // uses the database name from the URI
}

// ============================================
// FORUM/CULTURE CLUSTER (Separate MongoDB)
// ============================================
function getForumClientPromise(): Promise<MongoClient> {
  const rawMongoUri = process.env.FORUM_DATABASE_URL
  const MONGODB_URI = rawMongoUri ? normalizeMongoUri(rawMongoUri) : undefined

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the FORUM_DATABASE_URL environment variable in .env.local"
    )
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalThis._forumMongoClientPromise) {
      const client = new MongoClient(MONGODB_URI)
      globalThis._forumMongoClientPromise = client.connect()
    }
    return globalThis._forumMongoClientPromise
  } else {
    const client = new MongoClient(MONGODB_URI)
    return client.connect()
  }
}

/**
 * Returns the forum/culture database instance.
 * Strictly isolated: If the Forum DB fails, it throws a connection error.
 */
export async function getForumDb(): Promise<Db> {
  try {
    const client = await getForumClientPromise()
    return client.db("forum")
  } catch (error) {
    console.error("[CRITICAL] Forum Database Connection Error:", error)
    throw new Error("Forum Connection Error: Unable to connect to the forum/culture cluster.")
  }
}
