import { FlatList, View, Text, StyleSheet } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { useUserEntries } from '@/hooks/useUserEntries'
import { EntryCard } from '@/components/entry/EntryCard'
import { Colors } from '@/constants/colors'

export default function JournalScreen() {
  const { authUser } = useAuth()
  const { entries, loading } = useUserEntries(authUser?.uid ?? '', 'private')

  return (
    <FlatList
      data={entries}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EntryCard entry={item} showPrivateBadge={false} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>Your private entries — visible only to you</Text>
        </View>
      }
      ListEmptyComponent={
        !loading
          ? (
            <Text style={styles.empty}>
              Nothing here yet.{'\n'}Log a song as private and it'll appear here.
            </Text>
          )
          : null
      }
    />
  )
}

const styles = StyleSheet.create({
  list:        { paddingTop: 60, paddingBottom: 100, backgroundColor: Colors.background, flexGrow: 1 },
  headerBlock: { paddingHorizontal: 16, marginBottom: 20 },
  title:       { color: Colors.text, fontSize: 24, fontWeight: '700' },
  subtitle:    { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  empty:       { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, lineHeight: 24, paddingHorizontal: 32 },
})
