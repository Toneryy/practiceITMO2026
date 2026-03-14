import { FullscreenPlayer } from '@/components/elements/player/FullscreenPlayer'
import Layout from '@/components/layout/Layout'
import { AlbumPage } from '@/pages/AlbumPage'
import { Toaster } from 'sonner'
import { AlbumsPage } from '@/pages/AlbumsPage'
import { ArtistPage } from '@/pages/ArtistPage'
import { ArtistsPage } from '@/pages/ArtistsPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { HomePage } from '@/pages/HomePage'
import { LikedSongsPage } from '@/pages/LikedSongsPage'
import { PlaylistPage } from '@/pages/PlaylistPage'
import { RecentlyPlayedPage } from '@/pages/RecentlyPlayedPage'
import { SearchPage } from '@/pages/SearchPage'
import { catalogStore } from '@/store/catalog.store'
import { favoriteStore } from '@/store/favorite.store'
import { subscriptionStore } from '@/store/subscription.store'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

export default function App() {
	useEffect(() => {
		catalogStore.fetchAll()
		favoriteStore.fetchFavorites()
		subscriptionStore.fetchSubscriptions()
	}, [])

	return (
		<BrowserRouter>
			<FullscreenPlayer />
			<Toaster
				closeButton
				position="bottom-right"
				theme="dark"
				visibleToasts={3}
				toastOptions={{
					className: 'sonner-toast-custom',
					duration: 3000,
					style: {
						background: '#2B2B30',
						color: '#fff',
						borderRadius: '0.5rem'
					}
				}}
			/>
			<Layout>
				<Routes>
					<Route
						path="/"
						element={<HomePage />}
					/>
				<Route
					path="/search"
					element={<SearchPage />}
				/>
				<Route
					path="/discover"
					element={<DiscoverPage />}
				/>
					<Route
						path="/liked-songs"
						element={<LikedSongsPage />}
					/>
					<Route
						path="/playlist/:id"
						element={<PlaylistPage />}
					/>
					<Route
						path="/artists"
						element={<ArtistsPage />}
					/>
					<Route
						path="/artists/:name"
						element={<ArtistPage />}
					/>
					<Route
						path="/albums"
						element={<AlbumsPage />}
					/>
					<Route
						path="/albums/:name"
						element={<AlbumPage />}
					/>
					<Route
						path="/recently-played"
						element={<RecentlyPlayedPage />}
					/>
					<Route
						path="*"
						element={<Navigate to="/" replace />}
					/>
				</Routes>
			</Layout>
		</BrowserRouter>
	)
}
