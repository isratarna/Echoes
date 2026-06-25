import {
  doc, setDoc, deleteDoc, getDoc, serverTimestamp, writeBatch, increment,
} from 'firebase/firestore'
import { db } from './config'

function followId(followerId: string, followedId: string) {
  return `${followerId}_${followedId}`
}

export async function followUser(followerId: string, followedId: string) {
  const batch = writeBatch(db)
  batch.set(doc(db, 'follows', followId(followerId, followedId)), {
    followerId,
    followedId,
    createdAt: serverTimestamp(),
  })
  batch.update(doc(db, 'users', followerId), { followingCount: increment(1) })
  batch.update(doc(db, 'users', followedId), { followersCount: increment(1) })
  await batch.commit()
}

export async function unfollowUser(followerId: string, followedId: string) {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'follows', followId(followerId, followedId)))
  batch.update(doc(db, 'users', followerId), { followingCount: increment(-1) })
  batch.update(doc(db, 'users', followedId), { followersCount: increment(-1) })
  await batch.commit()
}

export async function isFollowing(followerId: string, followedId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'follows', followId(followerId, followedId)))
  return snap.exists()
}
