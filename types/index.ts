import { Timestamp } from 'firebase/firestore'

// ─── Spotify ──────────────────────────────────────────────────────────────────

export interface SpotifyTrack {
  id: string
  name: string
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; width: number; height: number }[]
  }
  external_urls: { spotify: string }
  duration_ms: number
  preview_url: string | null
}

export interface SpotifyTrackRef {
  spotifyTrackId: string
  trackName: string
  artistName: string
  albumName: string
  albumArtUrl: string
  spotifyUrl: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface TopSong extends SpotifyTrackRef {
  lyricLine: string
  resonanceNote: string
}

export interface User {
  uid: string
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  topFourSongs: TopSong[]
  entriesCount: number
  followersCount: number
  followingCount: number
  createdAt: Timestamp
}

// ─── Entry ────────────────────────────────────────────────────────────────────

export type Visibility = 'public' | 'private'

export interface SongEntry extends SpotifyTrackRef {
  id: string
  userId: string
  username: string
  userAvatarUrl: string
  lyricHighlight: string
  emotionalMeaning: string
  rating: number | null
  visibility: Visibility
  likesCount: number
  commentsCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Like {
  userId: string
  createdAt: Timestamp
}

export interface Comment {
  id: string
  userId: string
  username: string
  userAvatarUrl: string
  text: string
  createdAt: Timestamp
}

// ─── Playlist ─────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string
  userId: string
  title: string
  description: string
  coverArtUrl: string | null
  visibility: Visibility
  songsCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface PlaylistSong extends SpotifyTrackRef {
  id: string
  order: number
  lyricHighlight: string
  emotionalNote: string
  addedAt: Timestamp
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export interface Follow {
  followerId: string
  followedId: string
  createdAt: Timestamp
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}
