import { spotifyFetch } from './client'
import type { SpotifyTrack } from '@/types'

interface SearchResponse {
  tracks: { items: SpotifyTrack[] }
}

export async function searchTracks(q: string, limit = 20): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SearchResponse>(
    `/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}`
  )
  return data.tracks?.items ?? []
}
