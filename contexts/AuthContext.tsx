import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/services/firebase/config'
import type { AuthUser, User } from '@/types'

interface AuthContextValue {
  authUser:        AuthUser | null
  profile:         User | null
  loading:         boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue>({
  authUser: null, profile: null, loading: true, isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [profile,  setProfile]  = useState<User | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setAuthUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setAuthUser({
        uid:         firebaseUser.uid,
        email:       firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL:    firebaseUser.photoURL,
      })

      return onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        async (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as User)
          } else {
            const username = firebaseUser.email?.split('@')[0] ?? `user_${firebaseUser.uid.slice(0, 6)}`
            const fallback: Omit<User, 'createdAt'> & { createdAt: unknown } = {
              uid:            firebaseUser.uid,
              username,
              displayName:    firebaseUser.displayName ?? username,
              bio:            '',
              avatarUrl:      firebaseUser.photoURL ?? '',
              topFourSongs:   [],
              entriesCount:   0,
              followersCount: 0,
              followingCount: 0,
              createdAt:      serverTimestamp(),
            }
            await setDoc(doc(db, 'users', firebaseUser.uid), fallback)
          }
          setLoading(false)
        },
        () => setLoading(false),
      )
    })
  }, [])

  return (
    <AuthContext.Provider value={{ authUser, profile, loading, isAuthenticated: !!authUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
