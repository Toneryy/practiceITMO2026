import { PrismaClient } from '@prisma/client'

// Re-use a single PrismaClient instance across hot-reloads in development.
// In a real server environment this file runs once; the singleton pattern avoids
// connection pool exhaustion during Vite HMR restarts.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
	})

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}
