import { PrismaClient } from "@prisma/client";

interface SeedArtist {
  name: string;
  image: string;
  listenersCount: number;
}

interface SeedTrack {
  name: string;
  album: string;
  file: string;
  cover: string;
  duration: number;
  artistName: string;
  explicit: boolean;
}

interface SeedLyricsLine {
  time: number;
  text: string;
  section?: string;
}

interface SeedLyrics {
  trackName: string;
  lines: SeedLyricsLine[];
}

const SEED_ARTISTS: SeedArtist[] = [
  {
    name: "ANNA ASTI",
    image: "https://picsum.photos/seed/anna-asti/300/300",
    listenersCount: 2100000,
  },
  {
    name: "MACAN",
    image: "https://picsum.photos/seed/macan/300/300",
    listenersCount: 1500000,
  },
  {
    name: "INSTASAMKA",
    image: "https://picsum.photos/seed/instasamka/300/300",
    listenersCount: 3200000,
  },
  {
    name: "PHARAOH",
    image: "https://picsum.photos/seed/pharaoh/300/300",
    listenersCount: 2800000,
  },
  {
    name: "Скриптонит",
    image: "https://picsum.photos/seed/skriptonit/300/300",
    listenersCount: 2500000,
  },
  {
    name: "Король и Шут",
    image: "https://picsum.photos/seed/korol-i-shut/300/300",
    listenersCount: 1800000,
  },
  {
    name: "Jony",
    image: "https://picsum.photos/seed/jony/300/300",
    listenersCount: 4100000,
  },
  {
    name: "Элджей",
    image: "https://picsum.photos/seed/eldzej/300/300",
    listenersCount: 3000000,
  },
];

const SEED_TRACKS: SeedTrack[] = [
  // ANNA ASTI
  {
    name: "Царица",
    album: "Царица",
    file: "/audio/asti_tsaritsa.mp3",
    cover: "https://picsum.photos/seed/tsaritsa/300/300",
    duration: 215,
    artistName: "ANNA ASTI",
    explicit: false,
  },
  {
    name: "По барам",
    album: "Феникс",
    file: "/audio/asti_po_baram.mp3",
    cover: "https://picsum.photos/seed/po-baram/300/300",
    duration: 238,
    artistName: "ANNA ASTI",
    explicit: false,
  },

  // MACAN
  {
    name: "Asphalt 8",
    album: "12",
    file: "/audio/macan_asphalt.mp3",
    cover: "https://picsum.photos/seed/asphalt/300/300",
    duration: 162,
    artistName: "MACAN",
    explicit: false,
  },
  {
    name: "IVL",
    album: "12",
    file: "/audio/macan_ivl.mp3",
    cover: "https://picsum.photos/seed/macan12/300/300",
    duration: 145,
    artistName: "MACAN",
    explicit: false,
  },

  // INSTASAMKA (один Explicit для примера)
  {
    name: "За деньги да",
    album: "Popstar",
    file: "/audio/samka_money.mp3",
    cover: "https://picsum.photos/seed/popstar/300/300",
    duration: 118,
    artistName: "INSTASAMKA",
    explicit: true,
  },
  {
    name: "Как Mommy",
    album: "Popstar",
    file: "/audio/samka_mommy.mp3",
    cover: "https://picsum.photos/seed/popstar/300/300",
    duration: 132,
    artistName: "INSTASAMKA",
    explicit: false,
  },

  // PHARAOH
  {
    name: "Black Siemens",
    album: "Phlora",
    file: "/audio/pharaoh_siemens.mp3",
    cover: "https://picsum.photos/seed/siemens/300/300",
    duration: 175,
    artistName: "PHARAOH",
    explicit: true,
  },
  {
    name: "На луне",
    album: "Phuneral",
    file: "/audio/pharaoh_moon.mp3",
    cover: "https://picsum.photos/seed/moon/300/300",
    duration: 154,
    artistName: "PHARAOH",
    explicit: false,
  },

  // Скриптонит
  {
    name: "Это любовь",
    album: "Дом с нормальными явлениями",
    file: "/audio/skrip_love.mp3",
    cover: "https://picsum.photos/seed/skrip-house/300/300",
    duration: 240,
    artistName: "Скриптонит",
    explicit: false,
  },
  {
    name: "Положение",
    album: "Праздник на улице 36",
    file: "/audio/skrip_status.mp3",
    cover: "https://picsum.photos/seed/skrip-36/300/300",
    duration: 204,
    artistName: "Скриптонит",
    explicit: true,
  },

  // Король и Шут
  {
    name: "Кукла колдуна",
    album: "Акустический альбом",
    file: "/audio/kish_kukla.mp3",
    cover: "https://picsum.photos/seed/kish-akustika/300/300",
    duration: 203,
    artistName: "Король и Шут",
    explicit: false,
  },
  {
    name: "Лесник",
    album: "Будь как дома, путник",
    file: "/audio/kish_lesnik.mp3",
    cover: "https://picsum.photos/seed/kish-lesnik/300/300",
    duration: 191,
    artistName: "Король и Шут",
    explicit: false,
  },

  // Jony
  {
    name: "Комета",
    album: "Список твоих мыслей",
    file: "/audio/jony_kometa.mp3",
    cover: "https://picsum.photos/seed/kometa/300/300",
    duration: 158,
    artistName: "Jony",
    explicit: false,
  },

  // Элджей
  {
    name: "Минимал",
    album: "Sayonara Boy X",
    file: "/audio/eldzej_minimal.mp3",
    cover: "https://picsum.photos/seed/minimal/300/300",
    duration: 201,
    artistName: "Элджей",
    explicit: true,
  },
];

const SEED_LYRICS: SeedLyrics[] = [
  {
    trackName: "Комета",
    lines: [
      { time: 0, section: "Припев", text: "И пускай летают вокруг кометы" },
      { time: 5, text: "Мы с тобой одни на планете этой" },
    ],
  },
  {
    trackName: "Кукла колдуна",
    lines: [
      { time: 0, section: "Куплет 1", text: "В звёздную ночь при свете луны" },
      { time: 6, text: "Слышны голоса из-за крутой горы" },
    ],
  },
];

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Наполнение базы культурным контентом...");

  await prisma.user.upsert({
    where: { id: "default-user" },
    update: {},
    create: { id: "default-user" },
  });

  const artistMap = new Map<string, string>();
  for (const a of SEED_ARTISTS) {
    const record = await prisma.artist.upsert({
      where: { name: a.name },
      update: { image: a.image, listenersCount: a.listenersCount },
      create: {
        name: a.name,
        image: a.image,
        listenersCount: a.listenersCount,
      },
    });
    artistMap.set(record.name, record.id);
  }

  const albumKey = (t: SeedTrack) => `${t.artistName}|||${t.album}`;
  const seenAlbums = new Set<string>();
  const albumMap = new Map<string, string>();

  for (const t of SEED_TRACKS) {
    const key = albumKey(t);
    if (seenAlbums.has(key)) continue;
    seenAlbums.add(key);
    const artistId = artistMap.get(t.artistName);
    if (!artistId) continue;

    const album = await prisma.album.upsert({
      where: { name_artistId: { name: t.album, artistId } },
      update: { cover: t.cover },
      create: { name: t.album, cover: t.cover, artistId },
    });
    albumMap.set(key, album.id);
  }

  const trackMap = new Map<string, string>();
  for (const t of SEED_TRACKS) {
    const artistId = artistMap.get(t.artistName);
    if (!artistId) continue;
    const albumId = albumMap.get(albumKey(t));

    const track = await prisma.track.upsert({
      where: { name: t.name },
      update: {
        file: t.file,
        cover: t.cover,
        duration: t.duration,
        explicit: t.explicit,
        artistId,
        albumId,
      },
      create: {
        name: t.name,
        file: t.file,
        cover: t.cover,
        duration: t.duration,
        explicit: t.explicit,
        artistId,
        albumId,
      },
    });
    trackMap.set(track.name, track.id);
  }

  for (const l of SEED_LYRICS) {
    const trackId = trackMap.get(l.trackName);
    if (!trackId) continue;
    await prisma.lyrics.upsert({
      where: { trackId },
      update: { lines: JSON.stringify(l.lines) },
      create: { trackId, lines: JSON.stringify(l.lines) },
    });
  }

  console.log("✅ Сид завершен успешно. База данных готова к проверке!");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка сида:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
