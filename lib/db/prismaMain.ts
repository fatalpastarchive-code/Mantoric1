import { PrismaClient } from "../../prisma/generated/main"

const globalForPrisma = global as unknown as { mainDb: PrismaClient }

export const mainDb = globalForPrisma.mainDb || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.mainDb = mainDb

export default mainDb
