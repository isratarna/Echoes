import { Tabs, Redirect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { Colors } from '@/constants/colors'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

function icon(focused: boolean, active: IoniconsName, inactive: IoniconsName) {
  return ({ color }: { color: string }) => (
    <Ionicons name={focused ? active : inactive} size={24} color={color} />
  )
}

export default function TabLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor:  Colors.border,
          paddingBottom:   4,
          height:          60,
        },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused, color }) => icon(focused, 'home', 'home-outline')({ color }),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color }) => icon(focused, 'search', 'search-outline')({ color }),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Log',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ focused, color }) => icon(focused, 'book', 'book-outline')({ color }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => icon(focused, 'person-circle', 'person-circle-outline')({ color }),
        }}
      />
    </Tabs>
  )
}
