import { useState, useEffect } from 'react'
import { subscribeUserEntries } from '@/services/firebase/entries'
import type { SongEntry, Visibility } from '@/types'

export function useUserEntries(uid: string, visibility?: Visibility) {
  const [entries, setEntries] = useState<SongEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    return subscribeUserEntries(uid, visibility, (data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [uid, visibility])

  return { entries, loading }
}
