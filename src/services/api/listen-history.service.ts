import { prisma } from '../db.js'

export async function addListenRecord(userId: string, trackId: string) {
	return prisma.listenHistory.create({
		data: { userId, trackId }
	})
}

export async function getListenHistory(userId: string, limit = 50) {
	const records = await prisma.listenHistory.findMany({
		where: { userId },
		orderBy: { playedAt: 'desc' },
		take: limit,
		include: {
			track: { include: { artist: true, album: true } }
		}
	})

	const seen = new Set<string>()
	return records.filter((r: { trackId: string }) => {
		if (seen.has(r.trackId)) return false
		seen.add(r.trackId)
		return true
	})
}

export async function getListenStats(userId: string) {
	const totalListens = await prisma.listenHistory.count({
		where: { userId }
	})

	const topTracks = await prisma.listenHistory.groupBy({
		by: ['trackId'],
		where: { userId },
		_count: { trackId: true },
		orderBy: { _count: { trackId: 'desc' } },
		take: 10
	})

	return { totalListens, topTracks }
}
