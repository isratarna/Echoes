import { useState, useEffect, useRef } from 'react'
import { searchTracks } from '@/services/spotify/search'
import type { SpotifyTrack } from '@/types'

export function useSpotifySearch() {
  const [input,   setInput]   = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timer.current)
    if (input.trim().length < 2) { setResults([]); return }

    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        setResults(await searchTracks(input))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer.current)
  }, [input])

  return { input, setInput, results, loading }
}
