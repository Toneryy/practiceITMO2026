import { prisma } from '../db'

// ---------------------------------------------------------------------------
// Local row shapes — mirror the Prisma query includes.
// ---------------------------------------------------------------------------

interface SubscriptionRow {
	artist: { name: string }
}

/**
 * Returns the names of all artists the user is subscribed to.
 */
export async function getSubscribedArtistNames(userId: string): Promise<string[]> {
	const rows: SubscriptionRow[] = await prisma.userSubscription.findMany({
		where: { userId },
		include: { artist: { select: { name: true } } }
	})
	return rows.map((r: SubscriptionRow) => r.artist.name)
}

/**
 * Toggles an artist subscription for the user.
 * Returns `true` when now subscribed, `false` when unsubscribed.
 */
export async function toggleSubscription(userId: string, artistId: string): Promise<boolean> {
	const existing = await prisma.userSubscription.findUnique({
		where: { userId_artistId: { userId, artistId } }
	})

	if (existing) {
		await prisma.userSubscription.delete({ where: { id: existing.id } })
		return false
	}

	await prisma.userSubscription.create({ data: { userId, artistId } })
	return true
}
