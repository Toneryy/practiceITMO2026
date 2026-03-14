import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'itmotify-dev-secret-change-in-production'
const TOKEN_EXPIRY = '7d'

export async function registerUser(username: string, email: string, password: string) {
	const existing = await prisma.user.findFirst({
		where: { OR: [{ email }, { username }] }
	})
	if (existing) return null

	const hash = await bcrypt.hash(password, 10)
	const user = await prisma.user.create({
		data: { username, email, password: hash },
		select: { id: true, username: true, email: true, avatar: true, createdAt: true }
	})

	const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
	return { token, user }
}

export async function loginUser(email: string, password: string) {
	const user = await prisma.user.findUnique({ where: { email } })
	if (!user) return null

	const valid = await bcrypt.compare(password, user.password)
	if (!valid) return null

	const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
	return {
		token,
		user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, createdAt: user.createdAt }
	}
}

export function verifyToken(token: string): string | null {
	try {
		const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
		return payload.userId
	} catch {
		return null
	}
}

export async function getUserProfile(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			username: true,
			email: true,
			avatar: true,
			createdAt: true,
			_count: {
				select: {
					favorites: true,
					playlists: true,
					subscriptions: true,
					listenHistory: true
				}
			}
		}
	})
}

export async function updateUserAvatar(userId: string, avatar: string) {
	return prisma.user.update({
		where: { id: userId },
		data: { avatar },
		select: { id: true, username: true, email: true, avatar: true, createdAt: true }
	})
}
