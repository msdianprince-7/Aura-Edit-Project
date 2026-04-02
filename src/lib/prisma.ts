import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Initialize the Postgres Pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// Wrap the pool in the Prisma Adapter
const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
  // Pass the adapter into the PrismaClient
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma