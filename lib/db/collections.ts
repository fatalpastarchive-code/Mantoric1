/**
 * Typed MongoDB Collection Accessors
 *
 * Each helper returns a strongly-typed Collection using the
 * interfaces already defined in schema.ts — zero duplication.
 */
import type { Collection } from "mongodb"
import { getDb } from "./mongodb"
import type { User, Article, Comment, Like, ActivityLog, Follow } from "./schema"

export async function users(): Promise<Collection<User>> {
  const db = await getDb()
  return db.collection<User>("users")
}

export async function follows(): Promise<Collection<Follow>> {
  const db = await getDb()
  return db.collection<Follow>("follows")
}

export async function articles(): Promise<Collection<Article>> {
  const db = await getDb()
  return db.collection<Article>("articles")
}

export async function comments(): Promise<Collection<Comment>> {
  const db = await getDb()
  return db.collection<Comment>("comments")
}

export async function likes(): Promise<Collection<Like>> {
  const db = await getDb()
  return db.collection<Like>("likes")
}

export async function activityLogs(): Promise<Collection<ActivityLog>> {
  const db = await getDb()
  return db.collection<ActivityLog>("activityLogs")
}
