import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, router } from 'expo-router'
import { getUser } from '@/services/firebase/users'
import { subscribeUserEntries } from '@/services/firebase/entries'
import { followUser, unfollowUser, isFollowing } from '@/services/firebase/follows'
import { useAuth } from '@/contexts/AuthContext'
import { Colors } from '@/constants/colors'
import type { User, SongEntry } from '@/types'

interface StatProps { icon: React.ComponentProps<typeof Ionicons>['name']; value: number; label: string }

function Stat({ icon, value, label }: StatProps) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} style={styles.statIcon} />
      <Text style={styles.statNum}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { authUser } = useAuth()

  const [user,      setUser]      = useState<User | null>(null)
  const [entries,   setEntries]   = useState<SongEntry[]>([])
  const [following, setFollowing] = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [toggling,  setToggling]  = useState(false)

  const isSelf = authUser?.uid === id

  useEffect(() => {
    if (!id) return
    getUser(id).then((u) => { setUser(u); setLoading(false) })
    if (authUser && !isSelf) isFollowing(authUser.uid, id).then(setFollowing)
    return subscribeUserEntries(id, 'public', setEntries)
  }, [id, authUser?.uid])

  async function handleFollow() {
    if (!authUser || !id || toggling) return
    setToggling(true)
    try {
      if (following) {
        await unfollowUser(authUser.uid, id)
        setFollowing(false)
        setUser(u => u ? { ...u, followersCount: u.followersCount - 1 } : u)
      } else {
        await followUser(authUser.uid, id)
        setFollowing(true)
        setUser(u => u ? { ...u, followersCount: u.followersCount + 1 } : u)
      }
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
  }
  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.notFound}>User not found.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        <View style={styles.statsRow}>
          <Stat icon="musical-notes-outline" value={user.entriesCount}   label="Entries"   />
          <View style={styles.statDivider} />
          <Stat icon="people-outline"        value={user.followersCount} label="Followers" />
          <View style={styles.statDivider} />
          <Stat icon="person-add-outline"    value={user.followingCount} label="Following" />
        </View>

        {!isSelf && (
          <TouchableOpacity
            style={[styles.followBtn, following && styles.followBtnActive]}
            onPress={handleFollow}
            disabled={toggling}
            activeOpacity={0.8}
          >
            <Ionicons
              name={following ? 'checkmark' : 'person-add-outline'}
              size={15}
              color={following ? '#fff' : Colors.primary}
            />
            <Text style={[styles.followBtnText, following && styles.followBtnTextActive]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {user.topFourSongs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={14} color={Colors.primary} />
            <Text style={styles.sectionLabel}>Top Songs</Text>
          </View>
          {user.topFourSongs.map((song, i) => (
            <View key={i} style={styles.topSongRow}>
              <Text style={styles.topSongRank}>{i + 1}</Text>
              <View style={styles.topSongInfo}>
                <Text style={styles.topSongName}>{song.trackName}</Text>
                <Text style={styles.topSongArtist}>{song.artistName}</Text>
                {song.lyricLine ? <Text style={styles.topSongLyric}>"{song.lyricLine}"</Text> : null}
              </View>
              <Ionicons name="musical-note" size={14} color={Colors.surfaceAlt} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="grid-outline" size={14} color={Colors.primary} />
          <Text style={styles.sectionLabel}>Entries</Text>
        </View>
        {entries.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="musical-note-outline" size={36} color={Colors.surfaceAlt} />
            <Text style={styles.empty}>No public entries yet.</Text>
          </View>
        )}
        {entries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={styles.entryCard}
            activeOpacity={0.75}
            onPress={() => router.push(`/entry/${entry.id}`)}
          >
            <Image source={{ uri: entry.albumArtUrl }} style={styles.entryArt} />
            <View style={styles.entryInfo}>
              <Text style={styles.entryTrack}  numberOfLines={1}>{entry.trackName}</Text>
              <Text style={styles.entryArtist} numberOfLines={1}>{entry.artistName}</Text>
              {entry.rating != null && (
                <View style={styles.entryRatingRow}>
                  <Ionicons name="star" size={11} color={Colors.rating} />
                  <Text style={styles.entryRating}>{entry.rating}/10</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.surfaceAlt} />
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background },
  center:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12 },
  notFound:           { color: Colors.textMuted, fontSize: 16 },
  scroll:             { paddingBottom: 60 },
  nav:                { paddingHorizontal: 12, paddingTop: 60, paddingBottom: 8 },
  navBtn:             { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  header:             { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  avatar:             { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.surfaceAlt },
  displayName:        { color: Colors.text, fontSize: 20, fontWeight: '700', marginTop: 12 },
  username:           { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
  bio:                { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  statsRow:           { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  stat:               { alignItems: 'center', paddingHorizontal: 20 },
  statIcon:           { marginBottom: 4 },
  statNum:            { color: Colors.text, fontSize: 18, fontWeight: '700' },
  statLabel:          { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statDivider:        { width: 1, height: 36, backgroundColor: Colors.border },
  followBtn:          { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16, borderWidth: 1, borderColor: Colors.primary, borderRadius: 20, paddingHorizontal: 28, paddingVertical: 9 },
  followBtnActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  followBtnText:      { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  followBtnTextActive:{ color: '#fff' },
  section:            { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionLabel:       { color: Colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  emptyWrap:          { alignItems: 'center', paddingVertical: 32, gap: 10 },
  empty:              { color: Colors.textMuted, fontSize: 14 },
  topSongRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  topSongRank:        { color: Colors.textMuted, fontSize: 15, fontWeight: '700', width: 16 },
  topSongInfo:        { flex: 1 },
  topSongName:        { color: Colors.text, fontSize: 15, fontWeight: '600' },
  topSongArtist:      { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  topSongLyric:       { color: Colors.textMuted, fontSize: 13, fontStyle: 'italic', marginTop: 4 },
  entryCard:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, backgroundColor: Colors.surface, borderRadius: 10, padding: 10 },
  entryArt:           { width: 52, height: 52, borderRadius: 8, backgroundColor: Colors.surfaceAlt },
  entryInfo:          { flex: 1 },
  entryTrack:         { color: Colors.text, fontSize: 14, fontWeight: '600' },
  entryArtist:        { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  entryRatingRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  entryRating:        { color: Colors.rating, fontSize: 12, fontWeight: '700' },
})
