import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import observerPlugin from 'mobx-react-observer/babel-plugin'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [
					observerPlugin(
						// optional
						{ exclude: ['src/ui-components/**'] }
					)
				]
			}
		}),
		tailwindcss()
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
})
