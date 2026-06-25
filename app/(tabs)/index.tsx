import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useFeed } from '@/hooks/useFeed'
import { EntryCard } from '@/components/entry/EntryCard'
import { Colors } from '@/constants/colors'

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
      ListHeaderComponent={<Text style={styles.header}>Echoes</Text>}
      ListFooterComponent={
        fetching
          ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
          : null
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No entries yet. Be the first.</Text>
      }
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  list:   { paddingTop: 60, paddingBottom: 100, backgroundColor: Colors.background, flexGrow: 1 },
  header: { color: Colors.text, fontSize: 28, fontWeight: '700', paddingHorizontal: 16, marginBottom: 20 },
  empty:  { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
