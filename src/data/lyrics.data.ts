// Определяем тип
export interface ILyricsLine {
	time: number
	text: string
	section?: string
}

export interface ILyrics {
	trackName: string
	lines: ILyricsLine[]
}

// Маковые данные
export const LYRICS: ILyrics[] = [
	{
		trackName: '90s Bitch',
		lines: [
			{ time: 0, section: 'Verse 1', text: 'It might not be the right time' },
			{ time: 7, text: 'I might not be the right one' },
			{ time: 14, text: "But there's something about us I want to say" },
			{ time: 21, text: "'Cause there's something between us anyway" },
			{ time: 30, section: 'Verse 2', text: 'I might not be the right one' },
			{ time: 37, text: 'It might not be the right time' },
			{ time: 44, text: "But there's something about us" },
			{ time: 50, text: "I've got to do" },
			{ time: 56, text: 'Some kind of secret I will share with you' },
			{
				time: 65,
				section: 'Refrain',
				text: 'I need you more than anything in my life'
			},
			{ time: 72, text: 'I want you more than anything in my life' },
			{ time: 79, text: "I'll miss you more than anyone in my life" }
		]
	},
	{
		trackName: 'Emergency',
		lines: [
			{ time: 0, section: 'Intro', text: 'Yeah, this is just a test lyric' },
			{
				time: 10,
				section: 'Verse 1',
				text: 'Emergency lights flashing in my mind'
			},
			{ time: 20, text: 'Running through the night, no time to hide' },
			{ time: 30, text: 'Everything is louder, I can’t rewind' },
			{
				time: 40,
				section: 'Hook',
				text: 'Emergency, emergency, calling out my name'
			}
		]
	},
	{
		trackName: 'Free Yourself',
		lines: [
			{
				time: 0,
				section: 'Verse 1',
				text: 'Break the chains and free yourself'
			},
			{ time: 15, text: 'No more fear, just be yourself' },
			{ time: 30, section: 'Hook', text: 'Free yourself, free your mind' }
		]
	},
	{
		trackName: 'Insomnia',
		lines: [
			{ time: 0, section: 'Verse 1', text: 'Can’t sleep, the night is long' },
			{ time: 10, text: 'Thoughts racing, where do I belong?' },
			{ time: 20, section: 'Hook', text: 'Insomnia, take me away' },
			{ time: 30, text: 'To a place where I can stay' }
		]
	},
	{
		trackName: 'Konje',
		lines: [
			{ time: 0, section: 'Verse 1', text: 'Dancing under the moonlight' },
			{ time: 12, text: 'Feel the rhythm, it’s so right' },
			{ time: 24, section: 'Hook', text: 'Konje, let the music play' },
			{ time: 36, text: 'All night long, we’ll sway' }
		]
	}
]
