import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useSpotifySearch } from '@/hooks/useSpotifySearch'
import { Colors } from '@/constants/colors'

export default function SearchScreen() {
  const { input, setInput, results, loading } = useSpotifySearch()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <TextInput
        style={styles.input}
        placeholder="Search for a song..."
        placeholderTextColor={Colors.textMuted}
        value={input}
        onChangeText={setInput}
        clearButtonMode="while-editing"
      />

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}

      <FlatList
        data={results}
        keyExtractor={(t) => t.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push({ pathname: '/(tabs)/create', params: { trackId: item.id } })}
          >
            <Image
              source={{ uri: item.album.images.at(-1)?.url }}
              style={styles.art}
            />
            <View style={styles.rowText}>
              <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.artist} numberOfLines={1}>
                {item.artists.map(a => a.name).join(', ')}
              </Text>
            </View>
            <Text style={styles.logCta}>Log →</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          input.length >= 2 && !loading
            ? <Text style={styles.empty}>No results for "{input}"</Text>
            : input.length === 0
            ? <Text style={styles.hint}>Type a song, artist, or album</Text>
            : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  title:     { color: Colors.text, fontSize: 24, fontWeight: '700', paddingHorizontal: 16, marginBottom: 16 },
  input: {
    backgroundColor: Colors.surface, color: Colors.text, fontSize: 16,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 16, marginBottom: 8,
  },
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  art:       { width: 48, height: 48, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  rowText:   { flex: 1, marginLeft: 12 },
  trackName: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  artist:    { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  logCta:    { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  empty:     { color: Colors.textMuted, textAlign: 'center', marginTop: 40, paddingHorizontal: 32 },
  hint:      { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 14 },
})
