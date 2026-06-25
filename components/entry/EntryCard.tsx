import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { LyricHighlight } from './LyricHighlight'
import { Colors } from '@/constants/colors'
import type { SongEntry } from '@/types'
import { Timestamp } from 'firebase/firestore'

interface Props {
  entry:            SongEntry
  showPrivateBadge?: boolean
}

function formatTimestamp(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function EntryCard({ entry, showPrivateBadge = false }: Props) {
  const router = useRouter()

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/entry/${entry.id}`)}
    >
      <View style={styles.header}>
        <Image source={{ uri: entry.userAvatarUrl }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.username}>{entry.username}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(entry.createdAt)}</Text>
        </View>
        {showPrivateBadge && (
          <View style={styles.privateBadge}>
            <Text style={styles.privateBadgeText}>private</Text>
          </View>
        )}
        {entry.rating != null && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {entry.rating}<Text style={styles.ratingMax}>/10</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={styles.track}>
        <Image source={{ uri: entry.albumArtUrl }} style={styles.albumArt} />
        <View style={styles.trackInfo}>
          <Text style={styles.trackName}   numberOfLines={1}>{entry.trackName}</Text>
          <Text style={styles.artistName}  numberOfLines={1}>{entry.artistName}</Text>
          <Text style={styles.albumName}   numberOfLines={1}>{entry.albumName}</Text>
        </View>
      </View>

      <LyricHighlight text={entry.lyricHighlight} compact />

      <Text style={styles.meaning} numberOfLines={2}>{entry.emotionalMeaning}</Text>

      <View style={styles.footer}>
        <Text style={styles.stat}>♥ {entry.likesCount}</Text>
        <Text style={styles.stat}>💬 {entry.commentsCount}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius:    12,
    padding:         16,
    marginHorizontal: 16,
    marginBottom:    12,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceAlt },
  headerText:       { flex: 1, marginLeft: 10 },
  username:         { color: Colors.text, fontWeight: '600', fontSize: 14 },
  timestamp:        { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  privateBadge:     { backgroundColor: Colors.surfaceAlt, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  privateBadgeText: { color: Colors.private, fontSize: 11 },
  ratingBadge:      { backgroundColor: Colors.surfaceAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  ratingText:       { color: Colors.rating, fontWeight: '700', fontSize: 14 },
  ratingMax:        { color: Colors.textMuted, fontWeight: '400', fontSize: 11 },
  track:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  albumArt:   { width: 52, height: 52, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  trackInfo:  { flex: 1, marginLeft: 12 },
  trackName:  { color: Colors.text, fontWeight: '600', fontSize: 15 },
  artistName: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  albumName:  { color: Colors.textMuted, fontSize: 12, marginTop: 1 },
  meaning: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  footer:  { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  stat:    { color: Colors.textMuted, fontSize: 13 },
})
