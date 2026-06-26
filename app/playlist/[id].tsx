import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, router } from 'expo-router'
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import { Colors } from '@/constants/colors'
import type { Playlist, PlaylistSong } from '@/types'

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs,    setSongs]    = useState<PlaylistSong[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const snap = await getDoc(doc(db, 'playlists', id))
      if (!snap.exists()) { setLoading(false); return }
      setPlaylist(snap.data() as Playlist)
      const songsSnap = await getDocs(
        query(collection(db, 'playlists', id, 'songs'), orderBy('order', 'asc'))
      )
      setSongs(songsSnap.docs.map(d => d.data() as PlaylistSong))
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
  }
  if (!playlist) {
    return (
      <View style={styles.center}>
        <Ionicons name="list-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.notFound}>Playlist not found.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        {playlist.visibility === 'private' && (
          <View style={styles.privateBadge}>
            <Ionicons name="lock-closed-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.privateBadgeText}>Private</Text>
          </View>
        )}
      </View>

      <View style={styles.header}>
        {playlist.coverArtUrl ? (
          <Image source={{ uri: playlist.coverArtUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="musical-notes" size={64} color={Colors.primary} />
          </View>
        )}
        <Text style={styles.title}>{playlist.title}</Text>
        {playlist.description ? (
          <Text style={styles.description}>{playlist.description}</Text>
        ) : null}
        <TouchableOpacity style={styles.ownerBtn} onPress={() => router.push(`/user/${playlist.userId}`)}>
          <Ionicons name="person-outline" size={13} color={Colors.primary} />
          <Text style={styles.ownerLink}>View creator profile</Text>
          <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="musical-notes-outline" size={15} color={Colors.primary} />
          <Text style={styles.sectionLabel}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>

        {songs.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="add-circle-outline" size={40} color={Colors.surfaceAlt} />
            <Text style={styles.empty}>No songs in this playlist yet.</Text>
          </View>
        )}

        {songs.map((song, i) => (
          <View key={song.id} style={styles.songRow}>
            <View style={styles.songIndexWrap}>
              <Text style={styles.songIndex}>{i + 1}</Text>
            </View>
            <View style={styles.songInfo}>
              <Text style={styles.songName}   numberOfLines={1}>{song.trackName}</Text>
              <Text style={styles.songArtist} numberOfLines={1}>{song.artistName} · {song.albumName}</Text>
              {song.lyricHighlight ? (
                <View style={styles.lyricWrap}>
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color={Colors.primary} />
                  <Text style={styles.songLyric} numberOfLines={2}>"{song.lyricHighlight}"</Text>
                </View>
              ) : null}
              {song.emotionalNote ? (
                <View style={styles.noteWrap}>
                  <Ionicons name="heart-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.songNote} numberOfLines={2}>{song.emotionalNote}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: Colors.background },
  center:               { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12 },
  notFound:             { color: Colors.textMuted, fontSize: 16 },
  scroll:               { paddingBottom: 60 },
  nav:                  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 60, paddingBottom: 8 },
  navBtn:               { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  privateBadge:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  privateBadgeText:     { color: Colors.textMuted, fontSize: 13 },
  header:               { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  cover:                { width: 180, height: 180, borderRadius: 16, backgroundColor: Colors.surface },
  coverPlaceholder:     { justifyContent: 'center', alignItems: 'center' },
  title:                { color: Colors.text, fontSize: 22, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  description:          { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  ownerBtn:             { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 },
  ownerLink:            { color: Colors.primary, fontSize: 13 },
  section:              { paddingHorizontal: 16, marginTop: 8 },
  sectionHeader:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  sectionLabel:         { color: Colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  emptyWrap:            { alignItems: 'center', paddingVertical: 40, gap: 10 },
  empty:                { color: Colors.textMuted, fontSize: 14 },
  songRow:              { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  songIndexWrap:        { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  songIndex:            { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  songInfo:             { flex: 1 },
  songName:             { color: Colors.text, fontSize: 15, fontWeight: '600' },
  songArtist:           { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  lyricWrap:            { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 6 },
  songLyric:            { flex: 1, color: Colors.primary, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  noteWrap:             { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 4 },
  songNote:             { flex: 1, color: Colors.textMuted, fontSize: 13, lineHeight: 18 },
})
