import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from './config'
import type { User, TopSong } from '@/types'

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as User) : null
}

export async function updateProfile(
  uid: string,
  fields: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl'>>
) {
  await updateDoc(doc(db, 'users', uid), fields)
}

export async function updateTopFour(uid: string, songs: TopSong[]) {
  if (songs.length > 4) throw new Error('Top 4 maximum exceeded')
  await updateDoc(doc(db, 'users', uid), { topFourSongs: songs })
}
