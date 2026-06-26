import { initializeApp, getApps } from 'firebase/app'
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const firebaseConfig = {
  apiKey:        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:     process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId:         process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

function buildAuth() {
  if (Platform.OS === 'web') return getAuth(app)
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  } catch {
    return getAuth(app)
  }
}

export const auth    = buildAuth()
export const db      = getFirestore(app)
export const storage = getStorage(app)
