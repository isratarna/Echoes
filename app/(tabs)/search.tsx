import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSpotifySearch } from '@/hooks/useSpotifySearch'
import { Colors } from '@/constants/colors'

export default function SearchScreen() {
  const { input, setInput, results, loading } = useSpotifySearch()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      <View style={styles.inputWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Song, artist, or album…"
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          clearButtonMode="while-editing"
        />
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />}

      <FlatList
        data={results}
        keyExtractor={(t) => t.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.75}
            onPress={() => router.push({ pathname: '/(tabs)/create', params: { trackId: item.id } })}
          >
            <Image source={{ uri: item.album.images.at(-1)?.url }} style={styles.art} />
            <View style={styles.rowText}>
              <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.artist} numberOfLines={1}>
                {item.artists.map(a => a.name).join(', ')}
              </Text>
            </View>
            <View style={styles.logChip}>
              <Ionicons name="add" size={14} color={Colors.primary} />
              <Text style={styles.logChipText}>Log</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          input.length >= 2 && !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.empty}>No results for "{input}"</Text>
            </View>
          ) : input.length === 0 ? (
            <View style={styles.hintWrap}>
              <Ionicons name="musical-note-outline" size={48} color={Colors.surfaceAlt} />
              <Text style={styles.hint}>Search for a song to log it</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  title:       { color: Colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 16, marginBottom: 14 },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12 },
  inputIcon:   { marginRight: 8 },
  input:       { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 13 },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11 },
  art:         { width: 50, height: 50, borderRadius: 8, backgroundColor: Colors.surfaceAlt },
  rowText:     { flex: 1, marginLeft: 12 },
  trackName:   { color: Colors.text, fontSize: 14, fontWeight: '500' },
  artist:      { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  logChip:     { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  logChipText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  emptyWrap:   { alignItems: 'center', marginTop: 60, gap: 10 },
  empty:       { color: Colors.textMuted, fontSize: 14 },
  hintWrap:    { alignItems: 'center', marginTop: 80, gap: 12 },
  hint:        { color: Colors.textMuted, fontSize: 15 },
})
