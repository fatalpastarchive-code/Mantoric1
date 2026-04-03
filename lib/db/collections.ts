/**
 * Typed MongoDB Collection Accessors
 *
 * Each helper returns a strongly-typed Collection using the
 * interfaces already defined in schema.ts — zero duplication.
 */
import type { Collection } from "mongodb"
import { getDb, getForumDb } from "./mongodb"
import type { 
  User, 
  Article, 
  Comment, 
  Like, 
  ActivityLog, 
  Follow, 
  Rating, 
  QuizAttempt, 
  UserReview,
  Quiz,
  CulturalReview,
  SupportAnalytics,
  SupportIntent,
  PlatformStats,
  ForumTopic,
  ForumComment
} from "./schema"

export async function users(): Promise<Collection<User>> {
  const db = await getDb()
  return db.collection<User>("users")
}

export async function follows(): Promise<Collection<Follow>> {
  const db = await getDb()
  return db.collection<Follow>("follows")
}

export async function articles(): Promise<Collection<Article>> {
  const db = await getForumDb()
  return db.collection<Article>("articles")
}

export async function comments(): Promise<Collection<Comment>> {
  const db = await getForumDb()
  return db.collection<Comment>("comments")
}

export async function likes(): Promise<Collection<Like>> {
  const db = await getForumDb()
  return db.collection<Like>("likes")
}

export async function activityLogs(): Promise<Collection<ActivityLog>> {
  const db = await getForumDb()
  return db.collection<ActivityLog>("activityLogs")
}

export async function ratings(): Promise<Collection<Rating>> {
  const db = await getForumDb()
  return db.collection<Rating>("ratings")
}

export async function quizzes(): Promise<Collection<Quiz>> {
  const db = await getDb()
  return db.collection<Quiz>("quizzes")
}

export async function quizAttempts(): Promise<Collection<QuizAttempt>> {
  const db = await getDb()
  return db.collection<QuizAttempt>("quizAttempts")
}

export async function userReviews(): Promise<Collection<UserReview>> {
  const db = await getDb()
  return db.collection<UserReview>("userReviews")
}

export interface RespectRecord {
  _id?: string
  giverId: string
  receiverId: string
  givenAt: Date
}

export async function respects(): Promise<Collection<RespectRecord>> {
  const db = await getForumDb()
  return db.collection<RespectRecord>("respects")
}

export async function culturalReviews(): Promise<Collection<CulturalReview>> {
  const db = await getForumDb()
  return db.collection<CulturalReview>("culturalReviews")
}

export async function supportAnalytics(): Promise<Collection<SupportAnalytics>> {
  const db = await getDb()
  return db.collection<SupportAnalytics>("supportAnalytics")
}

export async function supportIntents(): Promise<Collection<SupportIntent>> {
  const db = await getDb()
  return db.collection<SupportIntent>("supportIntents")
}

export async function platformStats(): Promise<Collection<PlatformStats>> {
  const db = await getDb()
  return db.collection<PlatformStats>("platformStats")
}

export async function forumTopics(): Promise<Collection<ForumTopic>> {
  const db = await getForumDb()
  return db.collection<ForumTopic>("forumTopics")
}

export async function forumComments(): Promise<Collection<ForumComment>> {
  const db = await getForumDb()
  return db.collection<ForumComment>("forumComments")
}
