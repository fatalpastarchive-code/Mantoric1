/**
 * Seed Script — populate the ganghub database with sample data.
 *
 * Usage:
 *   npx tsx lib/db/seed.ts
 *
 * Requires MONGODB_URI to be set (reads .env.local automatically via dotenv).
 */
import { MongoClient } from "mongodb"
import type { User, Article } from "./schema"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ganghub"

async function seed() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()
    console.log("🔌 Connected to MongoDB")

    // ---- Users ----
    const usersCol = db.collection<User>("users")
    const existingUsers = await usersCol.countDocuments()

    if (existingUsers === 0) {
      const sampleUsers: User[] = [
        {
          _id: "admin",
          email: "admin@ganghub.com",
          username: "admin",
          passwordHash: "<hashed>",
          displayName: "Admin",
          avatar: "",
          bio: "GangHub administrator",
          xp: 99999,
          level: 50,
          rank: "Diamond",
          badges: [],
          articlesRead: 0,
          commentsCount: 0,
          likesGiven: 0,
          likesReceived: 0,
          role: "admin",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
        {
          _id: "marcus",
          email: "marcus@ganghub.com",
          username: "marcus",
          passwordHash: "<hashed>",
          displayName: "Marcus",
          xp: 15420,
          level: 28,
          rank: "Diamond",
          badges: [],
          articlesRead: 0,
          commentsCount: 0,
          likesGiven: 0,
          likesReceived: 0,
          role: "user",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
        {
          _id: "viktor",
          email: "viktor@ganghub.com",
          username: "viktor",
          passwordHash: "<hashed>",
          displayName: "Viktor",
          xp: 12350,
          level: 22,
          rank: "Platinum",
          badges: [],
          articlesRead: 0,
          commentsCount: 0,
          likesGiven: 0,
          likesReceived: 0,
          role: "user",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
        {
          _id: "alex",
          email: "alex@ganghub.com",
          username: "alex",
          passwordHash: "<hashed>",
          displayName: "Alex",
          xp: 9870,
          level: 18,
          rank: "Gold",
          badges: [],
          articlesRead: 0,
          commentsCount: 0,
          likesGiven: 0,
          likesReceived: 0,
          role: "user",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        },
      ]

      await usersCol.insertMany(sampleUsers)
      console.log(`✅ Inserted ${sampleUsers.length} users`)
    } else {
      console.log(`⏭️  Users collection already has ${existingUsers} docs — skipping`)
    }

    // ---- Articles ----
    const articlesCol = db.collection<Article>("articles")
    const existingArticles = await articlesCol.countDocuments()

    if (existingArticles === 0) {
      const sampleArticles: Article[] = [
        {
          _id: "art-1",
          slug: "stoic-guide-leadership",
          title: "The Stoic's Guide to Modern Leadership",
          excerpt:
            "How ancient philosophical principles can transform your approach to leading teams and making decisions in today's fast-paced world.",
          content: "Full article content goes here...",
          imageUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop",
          authorId: "marcus",
          category: "Philosophy",
          tags: ["stoicism", "leadership"],
          views: 1240,
          likesCount: 342,
          commentsCount: 56,
          readTime: 8,
          status: "published",
          isFeatured: false,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
          publishedAt: new Date("2024-01-15"),
        },
        {
          _id: "art-2",
          slug: "building-wealth-20s",
          title: "Building Wealth in Your 20s: A Practical Framework",
          excerpt:
            "Forget get-rich-quick schemes. Here's a systematic approach to building lasting wealth through disciplined investing and smart career moves.",
          content: "Full article content goes here...",
          imageUrl:
            "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop",
          authorId: "viktor",
          category: "Finance & Career",
          tags: ["finance", "career"],
          views: 980,
          likesCount: 287,
          commentsCount: 89,
          readTime: 12,
          status: "published",
          isFeatured: false,
          createdAt: new Date("2024-01-14"),
          updatedAt: new Date("2024-01-14"),
          publishedAt: new Date("2024-01-14"),
        },
        {
          _id: "art-3",
          slug: "science-unbreakable-habits",
          title: "The Science of Building Unbreakable Habits",
          excerpt:
            "Understanding the neurological mechanisms behind habit formation and how to leverage them for lasting personal transformation.",
          content: "Full article content goes here...",
          imageUrl:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop",
          authorId: "admin",
          category: "Self-Improvement",
          tags: ["habits", "psychology"],
          views: 2100,
          likesCount: 521,
          commentsCount: 124,
          readTime: 10,
          status: "published",
          isFeatured: true,
          createdAt: new Date("2024-01-13"),
          updatedAt: new Date("2024-01-13"),
          publishedAt: new Date("2024-01-13"),
        },
        {
          _id: "art-4",
          slug: "optimizing-training",
          title: "Optimizing Your Training: Evidence-Based Approaches",
          excerpt:
            "Cut through the fitness industry noise with research-backed training methodologies for building strength, muscle, and endurance.",
          content: "Full article content goes here...",
          imageUrl:
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop",
          authorId: "alex",
          category: "Fitness & Health",
          tags: ["fitness", "health"],
          views: 760,
          likesCount: 198,
          commentsCount: 45,
          readTime: 15,
          status: "published",
          isFeatured: false,
          createdAt: new Date("2024-01-12"),
          updatedAt: new Date("2024-01-12"),
          publishedAt: new Date("2024-01-12"),
        },
      ]

      await articlesCol.insertMany(sampleArticles)
      console.log(`✅ Inserted ${sampleArticles.length} articles`)
    } else {
      console.log(`⏭️  Articles collection already has ${existingArticles} docs — skipping`)
    }

    // ---- Indexes ----
    console.log("📇 Creating indexes...")

    await usersCol.createIndex({ email: 1 }, { unique: true })
    await usersCol.createIndex({ username: 1 }, { unique: true })
    await usersCol.createIndex({ xp: -1 })

    await articlesCol.createIndex({ slug: 1 }, { unique: true })
    await articlesCol.createIndex({ status: 1, publishedAt: -1 })
    await articlesCol.createIndex({ category: 1, publishedAt: -1 })
    await articlesCol.createIndex({ tags: 1 })

    const likesCol = db.collection("likes")
    await likesCol.createIndex({ userId: 1, targetId: 1 }, { unique: true })
    await likesCol.createIndex({ targetId: 1, targetType: 1 })

    const commentsCol = db.collection("comments")
    await commentsCol.createIndex({ articleId: 1, createdAt: -1 })
    await commentsCol.createIndex({ parentId: 1, createdAt: 1 })

    const activityCol = db.collection("activityLogs")
    await activityCol.createIndex({ userId: 1, createdAt: -1 })

    console.log("✅ Indexes created")
    console.log("\n🎉 Seed complete!")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()
