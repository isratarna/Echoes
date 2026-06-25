import { Tabs, Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { Colors } from '@/constants/colors'

export default function TabLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown:          false,
        tabBarStyle:          { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen name="index"   options={{ title: 'Feed',    tabBarLabel: 'Feed'    }} />
      <Tabs.Screen name="search"  options={{ title: 'Search',  tabBarLabel: 'Search'  }} />
      <Tabs.Screen name="create"  options={{ title: 'Log',     tabBarLabel: 'Log'     }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal', tabBarLabel: 'Journal' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
    </Tabs>
  )
}
