import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'
import type { User } from '@/types'

async function createUserDoc(uid: string, username: string, displayName: string, avatarUrl = '') {
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return // returning Google user — don't overwrite

  const data: Omit<User, 'createdAt'> & { createdAt: unknown } = {
    uid,
    username,
    displayName,
    bio: '',
    avatarUrl,
    topFourSongs:    [],
    entriesCount:    0,
    followersCount:  0,
    followingCount:  0,
    createdAt:       serverTimestamp(),
  }
  await setDoc(ref, data)
}

export async function registerWithEmail(email: string, password: string, username: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await createUserDoc(user.uid, username, username)
  return user
}

export async function loginWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export async function loginWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken)
  const { user }   = await signInWithCredential(auth, credential)
  const username   = user.email?.split('@')[0] ?? `user_${user.uid.slice(0, 6)}`
  await createUserDoc(user.uid, username, user.displayName ?? username, user.photoURL ?? '')
  return user
}

export const logout = () => signOut(auth)
