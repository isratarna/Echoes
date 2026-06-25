// Spotify auth: Client Credentials (MVP — search + metadata only).
// Migrate to Authorization Code Flow + PKCE via expo-auth-session
// when user-specific data (library, history, recs) is needed.

const TOKEN_URL = process.env.EXPO_PUBLIC_SPOTIFY_TOKEN_URL!

let cachedToken: string | null = null
let expiresAt = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < expiresAt - 60_000) return cachedToken

  const res = await fetch(TOKEN_URL)
  if (!res.ok) throw new Error('Failed to fetch Spotify token')

  const { access_token, expires_in } = await res.json()
  cachedToken = access_token
  expiresAt   = Date.now() + expires_in * 1000
  return cachedToken!
}

export async function spotifyFetch<T = unknown>(path: string): Promise<T> {
  const token = await getToken()
  const res   = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Spotify ${res.status}: ${path}`)
  return res.json()
}
