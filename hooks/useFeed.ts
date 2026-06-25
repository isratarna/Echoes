import { useState, useEffect } from 'react'
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { subscribeFeed, fetchMoreFeed } from '@/services/firebase/entries'
import type { SongEntry } from '@/types'

export function useFeed() {
  const [entries,  setEntries]  = useState<SongEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [hasMore,  setHasMore]  = useState(true)
  const [lastDoc,  setLastDoc]  = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    return subscribeFeed(
      (data) => {
        setEntries(data)
        setLoading(false)
        setHasMore(data.length === 20)
      },
      () => setLoading(false)
    )
  }, [])

  async function loadMore() {
    if (!lastDoc || !hasMore || fetching) return
    setFetching(true)
    try {
      const { entries: more, last } = await fetchMoreFeed(lastDoc)
      setEntries(prev => [...prev, ...more])
      setLastDoc(last)
      setHasMore(more.length === 20)
    } finally {
      setFetching(false)
    }
  }

  return { entries, loading, loadMore, hasMore, fetching }
}
