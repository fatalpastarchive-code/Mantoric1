/**
 * Nexus MongoDB Schema Definitions
 * 
 * Database: ganghub
 * Collections: users, articles, comments, likes, activity_logs
 */

// ============================================
// USER SCHEMA
// ============================================
export interface User {
  _id: string
  clerkId?: string     // Clerk
  email: string
  name?: string        // NextAuth legacy
  image?: string       // NextAuth legacy
  emailVerified?: Date | null // NextAuth legacy
  username?: string    // Optional for OAuth users until they set it
  passwordHash?: string // Optional for OAuth users
  displayName?: string
  avatar?: string
  bannerUrl?: string
  bio?: string
  statusNote?: string
  
  // Gamification
  followersCount: number
  followingCount: number
  xp: number
  level: number
  rank: UserRank
  badges: Badge[]
  
  // Stats
  articlesRead: number
  commentsCount: number
  likesGiven: number
  likesReceived: number
  
  // Metadata
  role: "user" | "moderator" | "admin"
  isVerified: boolean
  verificationCode?: string
  verificationCodeExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date
}

export type UserRank = "Newbie" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond"

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  awardedAt: Date
}

// XP thresholds for each rank
export const RANK_THRESHOLDS: Record<UserRank, number> = {
  Newbie: 0,
  Bronze: 100,
  Silver: 500,
  Gold: 1500,
  Platinum: 5000,
  Diamond: 15000,
}

// ============================================
// FOLLOW SCHEMA
// ============================================
export interface Follow {
  _id: string
  followerId: string
  followingId: string
  createdAt: Date
}

// XP rewards for actions
export const XP_REWARDS = {
  articleRead: 5,
  commentPosted: 10,
  commentReceived: 5,
  likeGiven: 2,
  likeReceived: 3,
  articleShared: 8,
  dailyLogin: 15,
  weeklyStreak: 50,
}

// ============================================
// ARTICLE SCHEMA
// ============================================
export interface Article {
  _id: string
  slug: string
  title: string
  excerpt: string
  content: string // Markdown or HTML
  imageUrl: string
  coverImage?: string
  
  // Author
  authorId: string
  authorName?: string
  
  // Categorization
  category: string
  tags: string[]
  
  // Stats
  views: number
  likesCount: number
  commentsCount: number
  readTime: number // in minutes
  
  // Status
  status: "draft" | "published" | "archived"
  isFeatured: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// ============================================
// COMMENT SCHEMA (Threaded)
// ============================================
export interface Comment {
  _id: string
  articleId: string
  authorId: string
  
  // Content
  content: string
  
  // Threading
  parentId?: string // null for root comments
  depth: number // 0 for root, 1 for reply, etc. (max depth: 3)
  
  // Stats
  likesCount: number
  repliesCount: number
  
  // Status
  isEdited: boolean
  isDeleted: boolean // soft delete
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// ============================================
// LIKE SCHEMA
// ============================================
export interface Like {
  _id: string
  userId: string
  targetId: string // articleId or commentId
  targetType: "article" | "comment"
  createdAt: Date
}

// ============================================
// ACTIVITY LOG SCHEMA (for XP tracking)
// ============================================
export interface ActivityLog {
  _id: string
  userId: string
  action: ActivityAction
  targetId?: string
  targetType?: "article" | "comment" | "user"
  xpAwarded: number
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type ActivityAction =
  | "article_read"
  | "comment_posted"
  | "comment_received"
  | "like_given"
  | "like_received"
  | "daily_login"
  | "badge_earned"
  | "level_up"

// ============================================
// MONGODB SCHEMA (JSON Format for reference)
// ============================================
export const MONGODB_SCHEMAS = {
  users: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "username", "passwordHash", "displayName", "xp", "level", "rank", "role", "createdAt"],
        properties: {
          email: { bsonType: "string", description: "User email - required and unique" },
          username: { bsonType: "string", description: "Username - required and unique" },
          passwordHash: { bsonType: "string", description: "Hashed password" },
          displayName: { bsonType: "string", description: "Display name" },
          clerkId: { bsonType: "string", description: "Clerk User ID" },
          avatar: { bsonType: "string", description: "Avatar URL" },
          bannerUrl: { bsonType: "string", description: "Banner URL" },
          bio: { bsonType: "string", description: "User bio" },
          statusNote: { bsonType: "string", description: "Short status or note" },
          xp: { bsonType: "int", minimum: 0, description: "Experience points" },
          level: { bsonType: "int", minimum: 1, description: "User level" },
          rank: { enum: ["Newbie", "Bronze", "Silver", "Gold", "Platinum", "Diamond"] },
          badges: { bsonType: "array", items: { bsonType: "object" } },
          role: { enum: ["user", "moderator", "admin"] },
          isVerified: { bsonType: "bool" },
          verificationCode: { bsonType: "string" },
          verificationCodeExpiresAt: { bsonType: "date" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
          lastActiveAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true },
      { key: { xp: -1 } }, // For leaderboard
      { key: { rank: 1, xp: -1 } },
    ],
  },
  
  articles: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["slug", "title", "content", "authorId", "category", "status", "createdAt"],
        properties: {
          slug: { bsonType: "string", description: "URL slug - unique" },
          title: { bsonType: "string" },
          excerpt: { bsonType: "string" },
          content: { bsonType: "string" },
          imageUrl: { bsonType: "string" },
          coverImage: { bsonType: "string" },
          authorId: { bsonType: "string" },
          authorName: { bsonType: "string" },
          category: { bsonType: "string" },
          tags: { bsonType: "array", items: { bsonType: "string" } },
          views: { bsonType: "int", minimum: 0 },
          likesCount: { bsonType: "int", minimum: 0 },
          commentsCount: { bsonType: "int", minimum: 0 },
          readTime: { bsonType: "int", minimum: 1 },
          status: { enum: ["draft", "published", "archived"] },
          isFeatured: { bsonType: "bool" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
          publishedAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { slug: 1 }, unique: true },
      { key: { status: 1, publishedAt: -1 } },
      { key: { category: 1, publishedAt: -1 } },
      { key: { tags: 1 } },
      { key: { isFeatured: 1, publishedAt: -1 } },
    ],
  },
  
  comments: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["articleId", "authorId", "content", "depth", "createdAt"],
        properties: {
          articleId: { bsonType: "objectId" },
          authorId: { bsonType: "objectId" },
          content: { bsonType: "string" },
          parentId: { bsonType: "objectId" },
          depth: { bsonType: "int", minimum: 0, maximum: 3 },
          likesCount: { bsonType: "int", minimum: 0 },
          repliesCount: { bsonType: "int", minimum: 0 },
          isEdited: { bsonType: "bool" },
          isDeleted: { bsonType: "bool" },
          createdAt: { bsonType: "date" },
          updatedAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { articleId: 1, createdAt: -1 } },
      { key: { parentId: 1, createdAt: 1 } },
      { key: { authorId: 1, createdAt: -1 } },
    ],
  },
  
  likes: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "targetId", "targetType", "createdAt"],
        properties: {
          userId: { bsonType: "objectId" },
          targetId: { bsonType: "objectId" },
          targetType: { enum: ["article", "comment"] },
          createdAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { userId: 1, targetId: 1 }, unique: true }, // Prevent duplicate likes
      { key: { targetId: 1, targetType: 1 } },
    ],
  },
  
  activityLogs: {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "action", "xpAwarded", "createdAt"],
        properties: {
          userId: { bsonType: "objectId" },
          action: { bsonType: "string" },
          targetId: { bsonType: "objectId" },
          targetType: { bsonType: "string" },
          xpAwarded: { bsonType: "int" },
          metadata: { bsonType: "object" },
          createdAt: { bsonType: "date" },
        },
      },
    },
    indexes: [
      { key: { userId: 1, createdAt: -1 } },
      { key: { action: 1, createdAt: -1 } },
    ],
  },
}
