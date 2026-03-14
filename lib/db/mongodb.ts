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

const rawMongoUri = process.env.MONGODB_URI
const MONGODB_URI = rawMongoUri ? normalizeMongoUri(rawMongoUri) : undefined

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  )
}

// Extend the global type so TypeScript doesn't complain
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI)
    globalThis._mongoClientPromise = client.connect()
  }
  clientPromise = globalThis._mongoClientPromise
} else {
  const client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export { clientPromise }

/**
 * Returns the default database instance.
 * Call this in API routes / server components:
 *
 *   const db = await getDb()
 *   const users = db.collection("users")
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db() // uses the database name from the URI
}
