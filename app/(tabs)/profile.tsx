import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useUserEntries } from '@/hooks/useUserEntries'
import { EntryCard } from '@/components/entry/EntryCard'
import { Colors } from '@/constants/colors'
import type { User } from '@/types'

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { authUser, profile } = useAuth()
  const { entries } = useUserEntries(authUser?.uid ?? '', 'public')

  if (!profile) return null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.header}>
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.statsRow}>
          <Stat label="entries"   value={profile.entriesCount}   />
          <Stat label="followers" value={profile.followersCount} />
          <Stat label="following" value={profile.followingCount} />
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/settings')}>
          <Text style={styles.editBtnText}>Edit profile</Text>
        </TouchableOpacity>
      </View>

      {profile.topFourSongs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Songs</Text>
          <View style={styles.topFourGrid}>
            {profile.topFourSongs.map((song) => (
              <View key={song.spotifyTrackId} style={styles.topFourCard}>
                <Image source={{ uri: song.albumArtUrl }} style={styles.topFourArt} />
                <Text style={styles.topFourTrack}  numberOfLines={1}>{song.trackName}</Text>
                <Text style={styles.topFourArtist} numberOfLines={1}>{song.artistName}</Text>
                <Text style={styles.topFourLyric}  numberOfLines={2}>"{song.lyricLine}"</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.playlistsBtn} onPress={() => router.push('/playlist')}>
        <Text style={styles.playlistsBtnText}>Memory Playlists →</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle2}>Entries</Text>
      {entries.map(e => <EntryCard key={e.id} entry={e} />)}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  scroll:         { paddingBottom: 100 },
  header:         { alignItems: 'center', paddingTop: 70, paddingBottom: 24, paddingHorizontal: 16 },
  avatar:         { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surfaceAlt },
  displayName:    { color: Colors.text, fontSize: 22, fontWeight: '700', marginTop: 12 },
  username:       { color: Colors.textSecondary, fontSize: 14, marginTop: 2 },
  bio:            { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  statsRow:       { flexDirection: 'row', gap: 32, marginTop: 16 },
  stat:           { alignItems: 'center' },
  statValue:      { color: Colors.text, fontSize: 18, fontWeight: '700' },
  statLabel:      { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  editBtn:        { marginTop: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  editBtnText:    { color: Colors.text, fontSize: 14 },
  section:        { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle:   { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  sectionTitle2:  { color: Colors.text, fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8, marginTop: 16 },
  topFourGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topFourCard:    { width: '47%', backgroundColor: Colors.surface, borderRadius: 10, padding: 10 },
  topFourArt:     { width: '100%', aspectRatio: 1, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  topFourTrack:   { color: Colors.text, fontSize: 13, fontWeight: '600', marginTop: 8 },
  topFourArtist:  { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  topFourLyric:   { color: Colors.primary, fontSize: 11, fontStyle: 'italic', marginTop: 6, lineHeight: 15 },
  playlistsBtn:   { marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: Colors.surface, borderRadius: 10, padding: 14 },
  playlistsBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
})
