import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Link, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={52} color={Colors.textMuted} />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.subtitle}>This screen doesn't exist.</Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Go home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, gap: 10 },
  title:     { color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
  subtitle:  { color: Colors.textMuted, fontSize: 14 },
  btn:       { marginTop: 12, backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnText:   { color: '#fff', fontWeight: '600', fontSize: 15 },
})
