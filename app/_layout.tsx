import { useEffect } from 'react'
import { Stack, useSegments, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

SplashScreen.preventAutoHideAsync()

function AuthGuard() {
  const { isAuthenticated, loading } = useAuth()
  const segments = useSegments()
  const router   = useRouter()

  useEffect(() => {
    if (loading) return
    SplashScreen.hideAsync()

    const inAuth = segments[0] === '(auth)'
    if (!isAuthenticated && !inAuth) router.replace('/(auth)/login')
    else if (isAuthenticated && inAuth) router.replace('/(tabs)/')
  }, [isAuthenticated, loading])

  return null
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D0D' } }}>
        <Stack.Screen name="(auth)"    options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"    options={{ headerShown: false }} />
        <Stack.Screen name="entry/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="user/[id]"  options={{ headerShown: false }} />
        <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  )
}
