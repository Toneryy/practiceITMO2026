/**
 * prisma/seed.ts
 *
 * Populates the database with Russian music content.
 * Run with:  npm run db:seed
 *
 * Idempotent: safe to re-run (uses upsert semantics).
 */

import { PrismaClient } from '@prisma/client'

interface SeedArtist {
	name: string
	image: string
	listenersCount: number
}

interface SeedTrack {
	name: string
	album: string
	file: string
	cover: string
	duration: number
	artistName: string
	explicit: boolean
}

interface SeedLyricsLine {
	time: number
	text: string
	section?: string
}

interface SeedLyrics {
	trackName: string
	lines: SeedLyricsLine[]
}

// ---------------------------------------------------------------------------
// Artists
// ---------------------------------------------------------------------------

const SEED_ARTISTS: SeedArtist[] = [
	{
		name: 'ANNA ASTI',
		image: 'https://picsum.photos/seed/anna-asti/300/300',
		listenersCount: 2_100_000
	},
	{
		name: 'MACAN',
		image: 'https://picsum.photos/seed/macan/300/300',
		listenersCount: 1_500_000
	},
	{
		name: 'INSTASAMKA',
		image: 'https://picsum.photos/seed/instasamka/300/300',
		listenersCount: 3_200_000
	},
	{
		name: 'PHARAOH',
		image: 'https://picsum.photos/seed/pharaoh/300/300',
		listenersCount: 2_800_000
	},
	{
		name: 'Скриптонит',
		image: 'https://picsum.photos/seed/skriptonit/300/300',
		listenersCount: 2_500_000
	},
	{
		name: 'Король и Шут',
		image: 'https://picsum.photos/seed/korol-i-shut/300/300',
		listenersCount: 1_800_000
	},
	{
		name: 'Jony',
		image: 'https://picsum.photos/seed/jony/300/300',
		listenersCount: 4_100_000
	},
	{
		name: 'Элджей',
		image: 'https://picsum.photos/seed/eldzej/300/300',
		listenersCount: 3_000_000
	}
]

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

const SEED_TRACKS: SeedTrack[] = [
	// ── ANNA ASTI ────────────────────────────────────────────────────────────
	{
		name: 'Привет, мама',
		album: 'ПРИВЕТ, МАМА',
		file: '/audio/anna_asti_privet_mama.mp3',
		cover: 'https://picsum.photos/seed/privet-mama/300/300',
		duration: 204,
		artistName: 'ANNA ASTI',
		explicit: false
	},
	{
		name: 'Мне нравится',
		album: 'МНЕ НРАВИТСЯ',
		file: '/audio/anna_asti_mne_nravitsya.mp3',
		cover: 'https://picsum.photos/seed/mne-nravitsya/300/300',
		duration: 165,
		artistName: 'ANNA ASTI',
		explicit: false
	},

	// ── MACAN ────────────────────────────────────────────────────────────────
	{
		name: 'Кислород',
		album: 'КИСЛОРОД',
		file: '/audio/macan_kislorod.mp3',
		cover: 'https://picsum.photos/seed/kislorod/300/300',
		duration: 198,
		artistName: 'MACAN',
		explicit: false
	},
	{
		name: 'Любовь, война',
		album: 'КИСЛОРОД',
		file: '/audio/macan_lyubov_voyna.mp3',
		cover: 'https://picsum.photos/seed/kislorod/300/300',
		duration: 185,
		artistName: 'MACAN',
		explicit: false
	},

	// ── INSTASAMKA ───────────────────────────────────────────────────────────
	{
		name: 'За деньги да',
		album: 'ЗАШЕЙ МНЕ ГЛАЗА',
		file: '/audio/instasamka_za_dengi_da.mp3',
		cover: 'https://picsum.photos/seed/instasamka-zasey/300/300',
		duration: 158,
		artistName: 'INSTASAMKA',
		explicit: true
	},
	{
		name: 'ГОРГОРОД',
		album: 'ГОРГОРОД',
		file: '/audio/instasamka_gorgorod.mp3',
		cover: 'https://picsum.photos/seed/gorgorod/300/300',
		duration: 175,
		artistName: 'INSTASAMKA',
		explicit: true
	},

	// ── PHARAOH ──────────────────────────────────────────────────────────────
	{
		name: 'Молодые крокодилы',
		album: 'ЗИМА',
		file: '/audio/pharaoh_molodye_krokodily.mp3',
		cover: 'https://picsum.photos/seed/pharaoh-zima/300/300',
		duration: 220,
		artistName: 'PHARAOH',
		explicit: true
	},
	{
		name: 'DOPE',
		album: 'ЗИМА',
		file: '/audio/pharaoh_dope.mp3',
		cover: 'https://picsum.photos/seed/pharaoh-zima/300/300',
		duration: 195,
		artistName: 'PHARAOH',
		explicit: true
	},

	// ── Скриптонит ───────────────────────────────────────────────────────────
	{
		name: 'Смешно',
		album: 'ДИСС КЕДРОВА',
		file: '/audio/skriptonit_smeshno.mp3',
		cover: 'https://picsum.photos/seed/skriptonit-diss/300/300',
		duration: 190,
		artistName: 'Скриптонит',
		explicit: true
	},
	{
		name: 'Космос',
		album: 'СТРИПТИЗ ОТЕЧЕСТВА',
		file: '/audio/skriptonit_kosmos.mp3',
		cover: 'https://picsum.photos/seed/skriptonit-strip/300/300',
		duration: 245,
		artistName: 'Скриптонит',
		explicit: true
	},

	// ── Король и Шут ─────────────────────────────────────────────────────────
	{
		name: 'Прыгну со скалы',
		album: 'Акустический альбом',
		file: '/audio/kish_prygnu_so_skaly.mp3',
		cover: 'https://picsum.photos/seed/kish-akustika/300/300',
		duration: 215,
		artistName: 'Король и Шут',
		explicit: false
	},
	{
		name: 'Лесник',
		album: 'Акустический альбом',
		file: '/audio/kish_lesnik.mp3',
		cover: 'https://picsum.photos/seed/kish-akustika/300/300',
		duration: 168,
		artistName: 'Король и Шут',
		explicit: false
	},

	// ── Jony ─────────────────────────────────────────────────────────────────
	{
		name: 'Тает лёд',
		album: 'Тает лёд',
		file: '/audio/jony_taet_lyod.mp3',
		cover: 'https://picsum.photos/seed/taet-lyod/300/300',
		duration: 202,
		artistName: 'Jony',
		explicit: false
	},

	// ── Элджей ───────────────────────────────────────────────────────────────
	{
		name: 'Розовое вино',
		album: 'SAYONARA BOY',
		file: '/audio/eldzej_rozovoe_vino.mp3',
		cover: 'https://picsum.photos/seed/sayonara-boy/300/300',
		duration: 213,
		artistName: 'Элджей',
		explicit: false
	},
	{
		name: 'Sayonara Baby',
		album: 'SAYONARA BOY',
		file: '/audio/eldzej_sayonara_baby.mp3',
		cover: 'https://picsum.photos/seed/sayonara-boy/300/300',
		duration: 188,
		artistName: 'Элджей',
		explicit: false
	}
]

// ---------------------------------------------------------------------------
// Lyrics
// ---------------------------------------------------------------------------

const SEED_LYRICS: SeedLyrics[] = [
	{
		trackName: 'Тает лёд',
		lines: [
			{ time: 0, section: 'Куплет 1', text: 'Тает лёд, и снег тает' },
			{ time: 7, text: 'И весна к нам приближается' },
			{ time: 14, text: 'Ты одна, ты улыбаешься' },
			{ time: 21, text: 'Ты моя, и это нравится' },
			{ time: 30, section: 'Припев', text: 'Тает лёд от твоих слов' },
			{ time: 37, text: 'Ты как солнце в небесах' },
			{ time: 44, text: 'Рядом ты, и всё светло' },
			{ time: 51, text: 'Тает лёд, тает лёд' }
		]
	},
	{
		trackName: 'Привет, мама',
		lines: [
			{ time: 0, section: 'Куплет 1', text: 'Привет, мама, я скучаю' },
			{ time: 8, text: 'Вспоминаю о тебе' },
			{ time: 16, text: 'Слышишь? Я не забываю' },
			{ time: 24, text: 'О твоей любви ко мне' },
			{ time: 34, section: 'Припев', text: 'Привет, мама, привет' },
			{ time: 40, text: 'Ты мой свет в темноте' },
			{ time: 47, text: 'Привет, мама, привет' },
			{ time: 54, text: 'Всё хорошо, ты не грусти' }
		]
	},
	{
		trackName: 'Прыгну со скалы',
		lines: [
			{ time: 0, section: 'Вступление', text: 'Прыгну со скалы вниз' },
			{ time: 9, text: 'В пропасть темноты' },
			{ time: 18, section: 'Куплет 1', text: 'Годы пронеслись, как птицы' },
			{ time: 27, text: 'Осенью над головой' },
			{ time: 36, text: 'Что мне снилось в детстве — снится' },
			{ time: 45, text: 'Мне и нынешней зимой' },
			{ time: 55, section: 'Припев', text: 'И я прыгну со скалы' },
			{ time: 63, text: 'В мир, где нет ни боли, ни тоски' }
		]
	},
	{
		trackName: 'Кислород',
		lines: [
			{ time: 0, section: 'Куплет 1', text: 'Ты мой кислород' },
			{ time: 8, text: 'Без тебя не могу дышать' },
			{ time: 16, text: 'Каждый новый день' },
			{ time: 23, text: 'Хочу рядом тебя держать' },
			{ time: 32, section: 'Припев', text: 'Ты мой кислород, моя любовь' },
			{ time: 40, text: 'Я задыхаюсь без тебя вновь' },
			{ time: 48, text: 'Ты мой кислород, моя земля' },
			{ time: 56, text: 'Мне нужна только ты' }
		]
	}
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const prisma = new PrismaClient()

async function main() {
	console.log('🌱  Seeding database with Russian music content...')

	// 1. Default user
	const user = await prisma.user.upsert({
		where: { id: 'default-user' },
		update: {},
		create: { id: 'default-user' }
	})
	console.log(`   ✓ User: ${user.id}`)

	// 2. Artists
	const artistMap = new Map<string, string>()
	for (const a of SEED_ARTISTS) {
		const record = await prisma.artist.upsert({
			where: { name: a.name },
			update: { image: a.image, listenersCount: a.listenersCount },
			create: { name: a.name, image: a.image, listenersCount: a.listenersCount }
		})
		artistMap.set(record.name, record.id)
	}
	console.log(`   ✓ Artists: ${artistMap.size}`)

	// 3. Albums
	const albumKey = (t: SeedTrack) => `${t.artistName}|||${t.album}`
	const seenAlbums = new Set<string>()
	const albumMap = new Map<string, string>()

	for (const t of SEED_TRACKS) {
		const key = albumKey(t)
		if (seenAlbums.has(key)) continue
		seenAlbums.add(key)

		const artistId = artistMap.get(t.artistName)
		if (!artistId) {
			console.warn(`   ⚠  Artist not found: "${t.artistName}"`)
			continue
		}

		const album = await prisma.album.upsert({
			where: { name_artistId: { name: t.album, artistId } },
			update: { cover: t.cover },
			create: { name: t.album, cover: t.cover, artistId }
		})
		albumMap.set(key, album.id)
	}
	console.log(`   ✓ Albums: ${albumMap.size}`)

	// 4. Tracks
	let trackCount = 0
	const trackMap = new Map<string, string>()

	for (const t of SEED_TRACKS) {
		const artistId = artistMap.get(t.artistName)
		if (!artistId) continue
		const albumId = albumMap.get(albumKey(t))

		const track = await prisma.track.upsert({
			where: { name: t.name },
			update: {
				file: t.file,
				cover: t.cover,
				duration: t.duration,
				explicit: t.explicit,
				artistId,
				albumId
			},
			create: {
				name: t.name,
				file: t.file,
				cover: t.cover,
				duration: t.duration,
				explicit: t.explicit,
				artistId,
				albumId
			}
		})
		trackMap.set(track.name, track.id)
		trackCount++
	}
	console.log(`   ✓ Tracks: ${trackCount} (${SEED_TRACKS.filter(t => t.explicit).length} explicit)`)

	// 5. Lyrics
	let lyricsCount = 0
	for (const l of SEED_LYRICS) {
		const trackId = trackMap.get(l.trackName)
		if (!trackId) {
			console.warn(`   ⚠  Track not found for lyrics: "${l.trackName}"`)
			continue
		}
		await prisma.lyrics.upsert({
			where: { trackId },
			update: { lines: JSON.stringify(l.lines) },
			create: { trackId, lines: JSON.stringify(l.lines) }
		})
		lyricsCount++
	}
	console.log(`   ✓ Lyrics: ${lyricsCount}`)

	console.log('✅  Seed complete.')
}

main()
	.catch(e => {
		console.error('❌  Seed failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
