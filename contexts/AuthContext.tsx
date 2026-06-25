import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
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

      return onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
        setProfile(snap.exists() ? (snap.data() as User) : null)
        setLoading(false)
      })
    })
  }, [])

  return (
    <AuthContext.Provider value={{ authUser, profile, loading, isAuthenticated: !!authUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
