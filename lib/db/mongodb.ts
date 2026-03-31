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

  const mongodbPrefix = "mongodb://"
  const mongodbSrvPrefix = "mongodb+srv://"

  const isStandard = url.startsWith(mongodbPrefix)
  const isSrv = url.startsWith(mongodbSrvPrefix)

  if (isStandard && !isSrv) {
    // Check if a port is present in the authority segment (e.g. host:27017)
    const rest = url.slice(mongodbPrefix.length)
    const authority = rest.split(/[/?]/)[0]
    const hasPort = authority.includes(":")

    // Only auto-upgrade to SRV if there is NO explicit port
    // (SRV URIs must not contain a port in the authority)
    if (!hasPort) {
      url = mongodbSrvPrefix + rest
    }
  }

  // Ensure retryable writes and majority write concern for better failover handling
  if (!url.includes("retryWrites=")) {
    const separator = url.includes("?") ? "&" : "?"
    url += `${separator}retryWrites=true&w=majority`
  }

  // If directConnection=true is present, flip it to false so the driver
  // can discover the replica set and talk to the current primary.
  if (url.includes("directConnection=true")) {
    url = url.replace("directConnection=true", "directConnection=false")
  }

  return url
}

// Extend the global type so TypeScript doesn't complain
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const rawMongoUri = process.env.MONGODB_URI
  const MONGODB_URI = rawMongoUri ? normalizeMongoUri(rawMongoUri) : undefined

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in .env.local"
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
const FORUM_MONGODB_URI = "mongodb+srv://forumdb:forumsifre@forum.bns5btn.mongodb.net/?appName=forum"

declare global {
  // eslint-disable-next-line no-var
  var _forumMongoClientPromise: Promise<MongoClient> | undefined
}

function getForumClientPromise(): Promise<MongoClient> {
  const MONGODB_URI = normalizeMongoUri(FORUM_MONGODB_URI)

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
 * Used for forumTopics, forumComments, and culturalReviews collections.
 * Falls back to main database if forum cluster is unreachable.
 */
export async function getForumDb(): Promise<Db> {
  try {
    const client = await getForumClientPromise()
    return client.db("forum")
  } catch (error) {
    console.warn("[getForumDb] Forum cluster connection failed, falling back to main database:", error)
    // Fallback to main database
    const client = await getClientPromise()
    return client.db()
  }
}
