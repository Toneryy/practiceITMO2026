import { makeAutoObservable } from 'mobx'
import i18n from '../i18n'

type Language = 'en' | 'ru'

class LanguageStore {
	language: Language =
		(localStorage.getItem('language') as Language) ?? 'en'

	constructor() {
		makeAutoObservable(this)
	}

	setLanguage(lang: Language) {
		this.language = lang
		localStorage.setItem('language', lang)
		i18n.changeLanguage(lang)
	}
}

export const languageStore = new LanguageStore()
