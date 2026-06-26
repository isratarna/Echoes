import { FlatList, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFeed } from '@/hooks/useFeed'
import { EntryCard } from '@/components/entry/EntryCard'
import { Colors } from '@/constants/colors'

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Ionicons name="musical-notes" size={22} color={Colors.primary} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>echoes</Text>
      </View>
      <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
        <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  )
}

export default function FeedScreen() {
  const { entries, loading, loadMore, fetching } = useFeed()

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EntryCard entry={item} />}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={<Header />}
      ListFooterComponent={
        fetching
          ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
          : null
      }
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Ionicons name="musical-notes-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to log a song.</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  list:          { paddingBottom: 100, backgroundColor: Colors.background, flexGrow: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  headerLeft:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIcon:    {},
  headerTitle:   { color: Colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  notifBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  emptyWrap:     { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle:    { color: Colors.text, fontSize: 17, fontWeight: '600' },
  emptySubtitle: { color: Colors.textMuted, fontSize: 14 },
})
