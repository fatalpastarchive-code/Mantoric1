/**
 * Nexus MongoDB Schema Definitions
 * 
 * Database: ganghub
 * Collections: users, articles, comments, likes, activity_logs
 */

// ============================================
// SUPPORT INTENT SCHEMA
// ============================================
export interface SupportIntent {
  _id: string
  userId?: string
  amount: string
  category: "Monthly" | "One-time"
  userEmail?: string
  createdAt: Date
}

// ============================================
// PLATFORM STATS SCHEMA
// ============================================
export interface PlatformStats {
  _id: string
  totalViews: number
  totalRespects: number
  activeUsers: number
  updatedAt: Date
}

// ============================================
// FORUM TOPIC SCHEMA
// ============================================
export type ForumTopicType = "GENERAL" | "ARTICLE_REF" | "CULTURE_REF"

export interface ForumTopic {
  _id: string
  title: string
  content: string // Markdown
  authorId: string
  authorName?: string
  category: string
  type: ForumTopicType
  relatedCultureId?: string
  relatedArticleId?: string
  views: number
  likesCount: number
  repliesCount: number
  isPinned: boolean
  isLocked: boolean
  createdAt: Date
  updatedAt: Date
  author?: {
    id: string
    clerkId?: string
    username?: string
    name: string
    avatar?: string | null
    rank: string
    xp: number
    respectPoints?: number
    bio?: string
  }
}

export interface ForumComment {
  _id: string
  topicId: string
  authorId: string
  authorName?: string
  content: string
  likesCount: number
  isEdited: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// SUPPORT ANALYTICS SCHEMA
// ============================================
export interface SupportAnalytics {
  _id: string
  views: number
  clicks: number
  updatedAt: Date
}

// ============================================
// CULTURAL REVIEW SCHEMA (TMDB & Google Books)
// ============================================
export type CulturalType = "MOVIE" | "SERIES" | "BOOK"

export interface CulturalReview {
  _id: string
  userId: string
  type: CulturalType
  externalId: string
  title: string
  imageUrl: string
  quote?: string
  review: string
  rating: number // 1-10
  createdAt: Date
  author?: {
    id: string
    clerkId?: string
    username?: string
    name: string
    avatar?: string | null
    rank: string
    xp: number
    respectPoints?: number
    bio?: string
  }
}

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
  
  // Gamification - Respect System (Replaces XP)
  followersCount: number
  followingCount: number
  respectPoints: number      // Total respect received from other users
  respectCapacity: number    // Max respects that can be given (starts at 1, increases with received respect)
  lastRespectGivenAt?: Date  // When user last gave respect (7-day cooldown)
  lastRespectGivenDate?: Date // Alias for compatibility
  rank: UserRank
  badgeLevel: BadgeLevel     // Newbie, Copper, Silver, Gold, Diamond
  badges: Badge[]
  streak: number             // Reading streak in days
  lastAxiomReadAt?: Date     // To track daily streak
  
  // Legacy fields (kept for migration, will be removed)
  xp?: number
  level?: number
  reputation?: number
  hype?: number
  
  // Onboarding & Interests
  interests: string[]
  onboardingCompleted?: boolean
  
  // Themes
  unlockedThemes: string[]
  activeTheme: string

  // Premium
  isPremium?: boolean
  subscriptionTier?: "free" | "black" | "founder"
  
  // Media Tracking
  watchedMedia: MediaItem[]
  readBooks: MediaItem[]
  
  // Stats
  articlesRead: number
  commentsCount: number
  likesGiven: number
  likesReceived: number
  
  // Metadata
  role: "user" | "moderator" | "admin" | "senator" | "gladiator" | "caesar"
  isVerified: boolean
  isVerifiedExpert: boolean // Professional verification
  expertField?: string      // Field of expertise
  verificationCode?: string
  verificationCodeExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date
}

export interface MediaItem {
  id: string
  type: "movie" | "book" | "series"
  title: string
  rating: number
  review?: string
  addedAt: Date
}

// ============================================
// QUIZ SCHEMA (Anti-Farm)
// ============================================
export interface Quiz {
  _id: string
  articleId: string
  questions: {
    question: string
    options: string[]
    correctAnswer: number // index
  }[]
  xpReward: number
  createdAt: Date
}

export interface QuizAttempt {
  _id: string
  userId: string
  articleId: string
  quizId: string
  isPassed: boolean
  score: number
  createdAt: Date
}

// ============================================
// USER REVIEW SCHEMA (Peer-to-Peer)
// ============================================
export interface UserReview {
  _id: string
  reviewerId: string
  targetUserId: string
  rating: number // 1-5
  content: string
  helpfulCount: number
  createdAt: Date
}

export type UserRank = "Newbie" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond"

export type BadgeLevel = "Newbie" | "Copper" | "Silver" | "Gold" | "Diamond"

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  awardedAt: Date
}

// ============================================
// BADGE LEVEL CALCULATOR (Based on Total Respect Points)
// ============================================
// 0-100: Newbie | 101-500: Copper | 501-1500: Silver | 1501-5000: Gold | 5001+: Diamond
export const calculateBadgeLevel = (respectPoints: number): BadgeLevel => {
  if (respectPoints >= 5001) return "Diamond"
  if (respectPoints >= 1501) return "Gold"
  if (respectPoints >= 501) return "Silver"
  if (respectPoints >= 101) return "Copper"
  return "Newbie"
}

/**
 * Calculates user reputation score
 * @deprecated Use respectPoints directly for primary ranking
 */
export const calculateReputation = (...args: number[]): number => {
  // Legacy signature used to be: (xp, hype, articlesRead)
  // New signature: (respectPoints, articlesRead)
  // We support both to avoid build breaks.

  if (args.length >= 3) {
    const xp = args[0] ?? 0
    const hype = args[1] ?? 0
    const articlesRead = args[2] ?? 0
    return xp + hype + Math.floor(articlesRead / 10)
  }

  const respectPoints = args[0] ?? 0
  const articlesRead = args[1] ?? 0
  return respectPoints + Math.floor(articlesRead / 10)
}

export const getBadgeColor = (badgeLevel: BadgeLevel): string => {
  const colors = {
    "Newbie": "#525252",
    "Copper": "#b87333",
    "Silver": "#c0c0c0",
    "Gold": "#ffd700",
    "Diamond": "#b9f2ff"
  }
  return colors[badgeLevel]
}

export const getBadgeGlow = (badgeLevel: BadgeLevel): string => {
  const glows = {
    "Newbie": "var(--glow-newbie)",
    "Copper": "var(--glow-copper)",
    "Silver": "var(--glow-silver)",
    "Gold": "var(--glow-gold)",
    "Diamond": "var(--glow-diamond)"
  }
  return glows[badgeLevel]
}

export const getExpertBadge = (isVerifiedExpert: boolean, expertField?: string) => {
  if (!isVerifiedExpert) return null
  return {
    label: expertField || "Verified Expert",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  }
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
  averageRating: number
  ratingsCount: number
  
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
// RATING SCHEMA
// ============================================
export interface Rating {
  _id: string
  userId: string
  articleId: string
  value: number // 1-5
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
  | "rating_given"

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
          respectPoints: { bsonType: "int", minimum: 0, description: "Total respect points" },
          streak: { bsonType: "int", minimum: 0, description: "Reading streak" },
          lastAxiomReadAt: { bsonType: "date" },
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
      { key: { respectPoints: -1 } }, // For leaderboard
      { key: { badgeLevel: 1, respectPoints: -1 } },
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
          averageRating: { bsonType: "double", minimum: 0, maximum: 5 },
          ratingsCount: { bsonType: "int", minimum: 0 },
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
