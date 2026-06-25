import {
  collection, doc, query, where, orderBy, limit,
  startAfter, getDocs, onSnapshot, runTransaction,
  writeBatch, increment, serverTimestamp,
  QueryDocumentSnapshot, DocumentData,
} from 'firebase/firestore'
import { db } from './config'
import type { SongEntry, Comment, SpotifyTrackRef, Visibility } from '@/types'

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createEntry(
  uid: string,
  username: string,
  userAvatarUrl: string,
  track: SpotifyTrackRef,
  fields: {
    lyricHighlight: string
    emotionalMeaning: string
    rating: number | null
    visibility: Visibility
  }
): Promise<string> {
  const newRef = doc(collection(db, 'entries'))

  await runTransaction(db, async (t) => {
    t.set(newRef, {
      id: newRef.id,
      userId: uid,
      username,
      userAvatarUrl,
      ...track,
      ...fields,
      likesCount:    0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    t.update(doc(db, 'users', uid), { entriesCount: increment(1) })
  })

  return newRef.id
}

export async function updateEntry(
  entryId: string,
  fields: Partial<Pick<SongEntry, 'lyricHighlight' | 'emotionalMeaning' | 'rating' | 'visibility'>>
) {
  await writeBatch(db)
    .update(doc(db, 'entries', entryId), { ...fields, updatedAt: serverTimestamp() })
    .commit()
}

export async function deleteEntry(entryId: string, uid: string) {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'entries', entryId))
  batch.update(doc(db, 'users', uid), { entriesCount: increment(-1) })
  await batch.commit()
}

// ── Social ─────────────────────────────────────────────────────────────────────

export async function toggleLike(entryId: string, uid: string, isLiked: boolean) {
  const batch    = writeBatch(db)
  const likeRef  = doc(db, 'entries', entryId, 'likes', uid)
  const entryRef = doc(db, 'entries', entryId)

  if (isLiked) {
    batch.delete(likeRef)
    batch.update(entryRef, { likesCount: increment(-1) })
  } else {
    batch.set(likeRef, { userId: uid, createdAt: serverTimestamp() })
    batch.update(entryRef, { likesCount: increment(1) })
  }
  await batch.commit()
}

export async function addComment(
  entryId: string,
  uid: string,
  username: string,
  userAvatarUrl: string,
  text: string
) {
  const newRef = doc(collection(db, 'entries', entryId, 'comments'))
  const batch  = writeBatch(db)
  batch.set(newRef, {
    id: newRef.id, userId: uid, username, userAvatarUrl, text,
    createdAt: serverTimestamp(),
  })
  batch.update(doc(db, 'entries', entryId), { commentsCount: increment(1) })
  await batch.commit()
}

// ── Queries ───────────────────────────────────────────────────────────────────

const PAGE = 20

export function subscribeFeed(
  callback: (entries: SongEntry[]) => void,
  onError: (e: Error) => void
) {
  return onSnapshot(
    query(
      collection(db, 'entries'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(PAGE)
    ),
    (snap) => callback(snap.docs.map(d => d.data() as SongEntry)),
    onError
  )
}

export async function fetchMoreFeed(
  after: QueryDocumentSnapshot<DocumentData>
): Promise<{ entries: SongEntry[]; last: QueryDocumentSnapshot<DocumentData> | null }> {
  const snap = await getDocs(
    query(
      collection(db, 'entries'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      startAfter(after),
      limit(PAGE)
    )
  )
  return {
    entries: snap.docs.map(d => d.data() as SongEntry),
    last:    snap.docs.at(-1) ?? null,
  }
}

export function subscribeUserEntries(
  uid: string,
  visibility: Visibility | undefined,
  callback: (entries: SongEntry[]) => void
) {
  const constraints = [
    where('userId', '==', uid),
    ...(visibility ? [where('visibility', '==', visibility)] : []),
    orderBy('createdAt', 'desc'),
  ]
  return onSnapshot(
    query(collection(db, 'entries'), ...constraints),
    (snap) => callback(snap.docs.map(d => d.data() as SongEntry))
  )
}

export function subscribeComments(
  entryId: string,
  callback: (comments: Comment[]) => void
) {
  return onSnapshot(
    query(
      collection(db, 'entries', entryId, 'comments'),
      orderBy('createdAt', 'asc')
    ),
    (snap) => callback(snap.docs.map(d => d.data() as Comment))
  )
}

export async function checkLiked(entryId: string, uid: string): Promise<boolean> {
  const snap = await getDocs(
    query(
      collection(db, 'entries', entryId, 'likes'),
      where('userId', '==', uid)
    )
  )
  return !snap.empty
}
