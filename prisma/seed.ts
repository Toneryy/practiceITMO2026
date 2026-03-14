import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Явно загружаем .env из корня проекта (prisma/seed.ts → ../.env)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// Last.fm
// ---------------------------------------------------------------------------

const LASTFM_API_KEY = process.env.LASTFM_API_KEY?.trim()
const LASTFM_ROOT = 'http://ws.audioscrobbler.com/2.0/'

interface LastfmArtistInfo {
	image: string | null
	bio: string | null
	listenersCount: number | null
}

async function fetchArtistInfo(artistName: string): Promise<LastfmArtistInfo> {
	const fallback: LastfmArtistInfo = { image: null, bio: null, listenersCount: null }
	if (!LASTFM_API_KEY) {
		console.warn('   ⚠  LASTFM_API_KEY не задан в .env — пропускаем запрос к Last.fm')
		return fallback
	}
	try {
		const url =
			`${LASTFM_ROOT}?method=artist.getinfo` +
			`&artist=${encodeURIComponent(artistName)}` +
			`&api_key=${LASTFM_API_KEY}` +
			`&format=json`

		const res = await fetch(url)
		if (!res.ok) return fallback
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data: any = await res.json()
		const a = data?.artist
		if (!a) return fallback

		// Last.fm uses 2a96cbd8b46e442fc41c2b86b821562f as a generic star placeholder
		const LASTFM_PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f'
		const isReal = (url: string) => url && !url.includes(LASTFM_PLACEHOLDER)

		const SIZE_PREF = ['mega', 'extralarge', 'large', 'medium', 'small', '']
		const images: { '#text': string; size: string }[] = a.image ?? []
		let image: string | null = null
		for (const size of SIZE_PREF) {
			const found = images.find(img => img.size === size && isReal(img['#text']))
			if (found) { image = found['#text']; break }
		}

		// Bio summary — Last.fm wraps it with a "Read more on Last.fm" HTML link
		const rawBio: string = a.bio?.summary ?? ''
		// Strip the trailing "Read more on Last.fm." anchor so we have clean text
		const bio = rawBio.replace(/<a[^>]*>Read more on Last\.fm<\/a>\.?/i, '').trim() || null

		const listenersCount = a.stats?.listeners ? Number(a.stats.listeners) : null

		return { image, bio, listenersCount }
	} catch (err) {
		console.warn(`   ⚠  Last.fm fetch failed for "${artistName}":`, (err as Error).message)
		return fallback
	}
}

// ---------------------------------------------------------------------------
// Deezer — фото артистов (бесплатно, без ключей, без гео-блокировок)
// ---------------------------------------------------------------------------

async function fetchDeezerArtistImage(artistName: string): Promise<string | null> {
	try {
		const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`
		const res = await fetch(url)
		if (!res.ok) {
			console.warn(`   [Deezer] Поиск "${artistName}" — ошибка ${res.status}`)
			return null
		}
		const data = (await res.json()) as {
			data?: { name: string; picture_xl?: string; picture_big?: string; picture_medium?: string }[]
		}
		const artist = data.data?.[0]
		if (!artist) {
			console.warn(`   [Deezer] "${artistName}" — не найден`)
			return null
		}
		const img = artist.picture_xl ?? artist.picture_big ?? artist.picture_medium ?? null
		return img
	} catch (err) {
		console.warn(`   [Deezer] "${artistName}" — ошибка:`, (err as Error).message)
		return null
	}
}

// ---------------------------------------------------------------------------
// Last.fm — обложки альбомов
// ---------------------------------------------------------------------------

async function fetchAlbumCover(artistName: string, albumName: string): Promise<string | null> {
	if (!LASTFM_API_KEY) return null
	try {
		const url =
			`${LASTFM_ROOT}?method=album.getinfo` +
			`&artist=${encodeURIComponent(artistName)}` +
			`&album=${encodeURIComponent(albumName)}` +
			`&api_key=${LASTFM_API_KEY}` +
			`&format=json`
		const res = await fetch(url)
		if (!res.ok) return null
		const data = (await res.json()) as { album?: { image?: { '#text': string; size: string }[] } }
		const images = data.album?.image ?? []
		const SIZE_PREF = ['mega', 'extralarge', 'large', 'medium', 'small', '']
		for (const size of SIZE_PREF) {
			const found = images.find((img: { size: string; '#text': string }) => img.size === size && img['#text'])
			if (found) return found['#text']
		}
		return null
	} catch {
		return null
	}
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface SeedArtist {
	name: string
	fallbackImage: string
	fallbackListeners: number
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
	{ name: 'ANNA ASTI',    fallbackImage: '',    fallbackListeners: 2100000 },
	{ name: 'MACAN',        fallbackImage: '',    fallbackListeners: 1500000 },
	{ name: 'INSTASAMKA',   fallbackImage: '',    fallbackListeners: 3200000 },
	{ name: 'PHARAOH',      fallbackImage: '',    fallbackListeners: 2800000 },
	{ name: 'Скриптонит',   fallbackImage: '',   fallbackListeners: 2500000 },
	{ name: 'Король и Шут', fallbackImage: '', fallbackListeners: 1800000 },
	{ name: 'Jony',         fallbackImage: '',         fallbackListeners: 4100000 },
	{ name: 'Элджей',       fallbackImage: '',       fallbackListeners: 3000000 }
]

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

// Full-length royalty-free tracks from SoundHelix (CC-licensed, no CORS block).
// Songs 1-16 are available at this URL pattern.
const SH = (n: number) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`

const SEED_TRACKS: SeedTrack[] = [
	// ANNA ASTI
	{ name: 'Царица',    album: 'Царица', file: SH(1),  duration: 372, cover: 'https://picsum.photos/seed/tsaritsa/300/300',  artistName: 'ANNA ASTI',    explicit: false },
	{ name: 'По барам',  album: 'Феникс', file: SH(2),  duration: 417, cover: 'https://picsum.photos/seed/po-baram/300/300',  artistName: 'ANNA ASTI',    explicit: false },

	// MACAN
	{ name: 'Asphalt 8', album: '12',     file: SH(3),  duration: 212, cover: 'https://picsum.photos/seed/asphalt/300/300',   artistName: 'MACAN',        explicit: false },
	{ name: 'IVL',       album: '12',     file: SH(4),  duration: 357, cover: 'https://picsum.photos/seed/macan12/300/300',   artistName: 'MACAN',        explicit: false },

	// INSTASAMKA
	{ name: 'За деньги да', album: 'Popstar', file: SH(5), duration: 234, cover: 'https://picsum.photos/seed/popstar/300/300',   artistName: 'INSTASAMKA',   explicit: true  },
	{ name: 'Как Mommy',    album: 'Popstar', file: SH(6), duration: 268, cover: 'https://picsum.photos/seed/popstar/300/300',   artistName: 'INSTASAMKA',   explicit: false },

	// PHARAOH
	{ name: 'Black Siemens', album: 'Phlora',   file: SH(7),  duration: 289, cover: 'https://picsum.photos/seed/siemens/300/300', artistName: 'PHARAOH',      explicit: true  },
	{ name: 'На луне',       album: 'Phuneral', file: SH(8),  duration: 193, cover: 'https://picsum.photos/seed/moon/300/300',    artistName: 'PHARAOH',      explicit: false },

	// Скриптонит
	{ name: 'Это любовь', album: 'Дом с нормальными явлениями', file: SH(9),  duration: 304, cover: 'https://picsum.photos/seed/skrip-house/300/300', artistName: 'Скриптонит',   explicit: false },
	{ name: 'Положение',  album: 'Праздник на улице 36',        file: SH(10), duration: 248, cover: 'https://picsum.photos/seed/skrip-36/300/300',   artistName: 'Скриптонит',   explicit: true  },

	// Король и Шут
	{ name: 'Кукла колдуна', album: 'Акустический альбом',  file: SH(11), duration: 322, cover: 'https://picsum.photos/seed/kish-akustika/300/300', artistName: 'Король и Шут', explicit: false },
	{ name: 'Лесник',        album: 'Будь как дома, путник', file: SH(1),  duration: 372, cover: 'https://picsum.photos/seed/kish-lesnik/300/300',  artistName: 'Король и Шут', explicit: false },

	// Jony
	{ name: 'Комета', album: 'Список твоих мыслей', file: SH(12), duration: 215, cover: 'https://picsum.photos/seed/kometa/300/300', artistName: 'Jony',     explicit: false },

	// Элджей
	{ name: 'Минимал', album: 'Sayonara Boy X', file: SH(13), duration: 261, cover: 'https://picsum.photos/seed/minimal/300/300', artistName: 'Элджей', explicit: true  }
]

// ---------------------------------------------------------------------------
// Lyrics
// ---------------------------------------------------------------------------

const SEED_LYRICS: SeedLyrics[] = [
	// ── Царица (ANNA ASTI) ────────────────────────────────────────────────────
	{
		trackName: 'Царица',
		lines: [
			{ time: 0, section: 'Куплет 1', text: 'Я не та, что была вчера' },
			{ time: 5, text: 'Я сильнее, чем ты думал' },
			{ time: 10, text: 'Каждый шаг — моя игра' },
			{ time: 15, text: 'И ты больше не обманул' },
			{ time: 22, section: 'Припев', text: 'Я царица, я в короне' },
			{ time: 27, text: 'Мой трон — мои условия' },
			{ time: 32, text: 'Ты хотел меня сломать' },
			{ time: 37, text: 'Но я выше и сильнее' },
			{ time: 44, section: 'Куплет 2', text: 'Я не плачу по ночам' },
			{ time: 49, text: 'Я смеюсь на весь свой мир' },
			{ time: 54, text: 'Уступать не буду вам' },
			{ time: 59, text: 'Я своих желаний жир' },
			{ time: 66, section: 'Припев', text: 'Я царица, я в короне' },
			{ time: 71, text: 'Мой трон — мои условия' },
			{ time: 76, text: 'Ты хотел меня сломать' },
			{ time: 81, text: 'Но я выше и сильнее' },
			{ time: 88, section: 'Бридж', text: 'Не прогнусь, не поддамся' },
			{ time: 93, text: 'Я иду своей дорогой' },
			{ time: 98, text: 'Каждый раз я поднимаюсь' },
			{ time: 103, text: 'Вновь сильнее и красивее' },
			{ time: 110, section: 'Аутро', text: 'Я царица... я царица...' }
		]
	},

	// ── Положение (Скриптонит) ────────────────────────────────────────────────
	{
		trackName: 'Положение',
		lines: [
			{ time: 0, section: 'Вступление', text: 'Знаешь, мне всё равно что думают' },
			{ time: 6, text: 'Я своё положение сам выбираю' },
			{ time: 13, section: 'Куплет 1', text: 'Поднялся с низа сам, без помощи чужих' },
			{ time: 18, text: 'Мои слова звучат весомей, чем у них' },
			{ time: 23, text: 'Я шёл один, пока они смотрели вслед' },
			{ time: 28, text: 'Теперь я здесь, а их истории — в ответ' },
			{ time: 35, section: 'Припев', text: 'Положение — это не деньги' },
			{ time: 40, text: 'Положение — это то, как ты живёшь' },
			{ time: 45, text: 'Я не ищу признания у всех' },
			{ time: 50, text: 'Я сам себе и судья, и успех' },
			{ time: 57, section: 'Куплет 2', text: 'Мне говорили: "Брось, не выйдет ничего"' },
			{ time: 62, text: 'Я слышал, но не верил никому' },
			{ time: 67, text: 'Дорога длинная, но я шагал вперёд' },
			{ time: 72, text: 'И каждый падёж был просто поворот' },
			{ time: 79, section: 'Припев', text: 'Положение — это не деньги' },
			{ time: 84, text: 'Положение — это то, как ты живёшь' },
			{ time: 89, text: 'Я не ищу признания у всех' },
			{ time: 94, text: 'Я сам себе и судья, и успех' },
			{ time: 101, section: 'Аутро', text: 'Моё положение — моя свобода' }
		]
	},

	// ── Прыгну со скалы (Король и Шут) ───────────────────────────────────────
	{
		trackName: 'Прыгну со скалы',
		lines: [
			{ time: 0, section: 'Вступление', text: 'Прыгну со скалы вниз' },
			{ time: 5, text: 'В пропасть темноты' },
			{ time: 11, section: 'Куплет 1', text: 'Годы пронеслись, как птицы' },
			{ time: 16, text: 'Осенью над головой' },
			{ time: 21, text: 'Что мне снилось в детстве — снится' },
			{ time: 26, text: 'Мне и нынешней зимой' },
			{ time: 32, text: 'Я стою на краю скалы' },
			{ time: 37, text: 'Ветер треплет мне волосы' },
			{ time: 42, text: 'Подо мной — голоса земли' },
			{ time: 47, text: 'И небесные полосы' },
			{ time: 53, section: 'Припев', text: 'И я прыгну со скалы' },
			{ time: 58, text: 'В мир, где нет ни боли, ни тоски' },
			{ time: 63, text: 'Прыгну со скалы' },
			{ time: 68, text: 'И растворюсь в потоке реки' },
			{ time: 75, section: 'Куплет 2', text: 'Солнца нет, лишь серый свет' },
			{ time: 80, text: 'Тучи над вершиной гор' },
			{ time: 85, text: 'Оглянусь — и дороги нет' },
			{ time: 90, text: 'Только скалы да простор' },
			{ time: 96, text: 'Где-то там, внизу, покой' },
			{ time: 101, text: 'Где не надо ничего' },
			{ time: 106, text: 'Только ветер за спиной' },
			{ time: 111, text: 'И молчание всего' },
			{ time: 117, section: 'Припев', text: 'И я прыгну со скалы' },
			{ time: 122, text: 'В мир, где нет ни боли, ни тоски' },
			{ time: 127, text: 'Прыгну со скалы' },
			{ time: 132, text: 'И растворюсь в потоке реки' },
			{ time: 139, section: 'Аутро', text: 'Прыгну... прыгну...' }
		]
	},

	// ── Комета (Jony) ─────────────────────────────────────────────────────────
	{
		trackName: 'Комета',
		lines: [
			{ time: 0, section: 'Припев', text: 'И пускай летают вокруг кометы' },
			{ time: 5, text: 'Мы с тобой одни на планете этой' }
		]
	},

	// ── Кукла колдуна (Король и Шут) ─────────────────────────────────────────
	{
		trackName: 'Кукла колдуна',
		lines: [
			{ time: 0, section: 'Куплет 1', text: 'В звёздную ночь при свете луны' },
			{ time: 6, text: 'Слышны голоса из-за крутой горы' }
		]
	}
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const prisma = new PrismaClient()

async function main() {
	console.log('🌱  Наполнение базы данных...')
	console.log(`   [DEBUG] .env загружен из: ${path.resolve(__dirname, '..', '.env')}`)
	console.log(
		`   [DEBUG] LASTFM_API_KEY: ${LASTFM_API_KEY ? `${LASTFM_API_KEY.slice(0, 8)}... (OK)` : 'НЕ ЗАДАН!'}`
	)

	await prisma.user.upsert({
		where: { id: 'default-user' },
		update: {},
		create: { id: 'default-user' }
	})

	// ── Artists (Deezer → Last.fm → пусто) ──────────────────────────────────
	console.log('   ⏳ Загружаем данные артистов (Deezer + Last.fm)...')
	const artistMap = new Map<string, string>()

	for (const a of SEED_ARTISTS) {
		const lfm = await fetchArtistInfo(a.name)
		const listenersCount = lfm.listenersCount ?? a.fallbackListeners
		const bio = lfm.bio ?? null

		let image = ''
		let photoSource = '—'

		// 1) Deezer — основной источник фото (без ключей, без гео-блокировок)
		const deezerImg = await fetchDeezerArtistImage(a.name)
		if (deezerImg) {
			image = deezerImg
			photoSource = 'Deezer'
		}

		// 2) Last.fm — если Deezer не вернул
		if (!image && lfm.image) {
			image = lfm.image
			photoSource = 'Last.fm'
		}

		const record = await prisma.artist.upsert({
			where: { name: a.name },
			update: { image, listenersCount, bio },
			create: { name: a.name, image, listenersCount, bio }
		})
		artistMap.set(record.name, record.id)

		console.log(`   ✓ ${a.name} (${listenersCount.toLocaleString()} listeners, photo: ${photoSource})`)
	}

	// ── Albums (обложки из Last.fm, fallback — picsum) ─────────────────────────
	const albumKey = (t: SeedTrack) => `${t.artistName}|||${t.album}`
	const seenAlbums = new Set<string>()
	const albumMap = new Map<string, string>()
	const albumCoverCache = new Map<string, string>() // key -> cover URL

	for (const t of SEED_TRACKS) {
		const key = albumKey(t)
		if (seenAlbums.has(key)) continue
		seenAlbums.add(key)
		const artistId = artistMap.get(t.artistName)
		if (!artistId) continue

		let cover = albumCoverCache.get(key)
		if (!cover) {
			const lfmCover = await fetchAlbumCover(t.artistName, t.album)
			cover = lfmCover || t.cover
			albumCoverCache.set(key, cover)
		}

		const album = await prisma.album.upsert({
			where: { name_artistId: { name: t.album, artistId } },
			update: { cover },
			create: { name: t.album, cover, artistId }
		})
		albumMap.set(key, album.id)
	}

	// ── Tracks (обложка из альбома) ───────────────────────────────────────────
	const trackMap = new Map<string, string>()
	for (const t of SEED_TRACKS) {
		const artistId = artistMap.get(t.artistName)
		if (!artistId) continue
		const albumId = albumMap.get(albumKey(t))
		const cover = albumCoverCache.get(albumKey(t)) ?? t.cover

		const track = await prisma.track.upsert({
			where: { name: t.name },
			update: { file: t.file, cover, duration: t.duration, explicit: t.explicit, artistId, albumId },
			create: { name: t.name, file: t.file, cover, duration: t.duration, explicit: t.explicit, artistId, albumId }
		})
		trackMap.set(track.name, track.id)
	}
	console.log(`   ✓ Tracks: ${trackMap.size} (${SEED_TRACKS.filter(t => t.explicit).length} explicit)`)

	// ── Lyrics ────────────────────────────────────────────────────────────────
	let lyricsCount = 0
	for (const l of SEED_LYRICS) {
		const trackId = trackMap.get(l.trackName)
		if (!trackId) continue
		await prisma.lyrics.upsert({
			where: { trackId },
			update: { lines: JSON.stringify(l.lines) },
			create: { trackId, lines: JSON.stringify(l.lines) }
		})
		lyricsCount++
	}
	console.log(`   ✓ Lyrics: ${lyricsCount} tracks`)

	console.log('✅  Сид завершён. База данных готова!')
}

main()
	.catch(e => {
		console.error('❌  Ошибка сида:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
