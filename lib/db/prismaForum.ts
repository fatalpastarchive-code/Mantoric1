import { PrismaClient } from "../../prisma/generated/forum"

const globalForPrisma = global as unknown as { forumDb: PrismaClient }

export const forumDb = globalForPrisma.forumDb || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.forumDb = forumDb

export default forumDb
