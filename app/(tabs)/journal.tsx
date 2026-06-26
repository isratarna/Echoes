import { FlatList, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
          <View style={styles.titleRow}>
            <Ionicons name="book" size={26} color={Colors.primary} />
            <Text style={styles.title}>Journal</Text>
          </View>
          <View style={styles.subtitleRow}>
            <Ionicons name="lock-closed-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.subtitle}>Private entries — visible only to you</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="lock-closed-outline" size={52} color={Colors.surfaceAlt} />
            <Text style={styles.emptyTitle}>Your private journal</Text>
            <Text style={styles.emptySub}>
              Log a song as Private and it'll{'\n'}appear here — just for you.
            </Text>
          </View>
        ) : null
      }
    />
  )
}

const styles = StyleSheet.create({
  list:         { paddingTop: 60, paddingBottom: 100, backgroundColor: Colors.background, flexGrow: 1 },
  headerBlock:  { paddingHorizontal: 16, marginBottom: 20 },
  titleRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title:        { color: Colors.text, fontSize: 26, fontWeight: '800' },
  subtitleRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  subtitle:     { color: Colors.textMuted, fontSize: 13 },
  emptyWrap:    { alignItems: 'center', marginTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyTitle:   { color: Colors.text, fontSize: 17, fontWeight: '600', marginTop: 4 },
  emptySub:     { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
})
