import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { AppModal } from '@/components/ui/AppModal'
import { ImageEditor } from '@/components/ui/ImageEditor'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useUserEntries } from '@/hooks/useUserEntries'
import { uploadAvatar } from '@/services/firebase/storageUpload'
import { EntryCard } from '@/components/entry/EntryCard'
import { Colors } from '@/constants/colors'

type IconName = React.ComponentProps<typeof Ionicons>['name']
interface StatProps { label: string; value: number; icon: IconName }

function Stat({ label, value, icon }: StatProps) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={Colors.textMuted} style={styles.statIcon} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { authUser, profile, loading } = useAuth()
  const { entries } = useUserEntries(authUser?.uid ?? '', 'public')
  const [uploading,       setUploading]       = useState(false)
  const [localAvatarUri,  setLocalAvatarUri]  = useState<string | null>(null)
  const [editorUri,       setEditorUri]       = useState<string | null>(null)
  const [photoSheet,      setPhotoSheet]      = useState(false)
  const [alertModal,      setAlertModal]      = useState({ visible: false, title: '', message: '' })

  function showAlert(title: string, message: string) {
    setAlertModal({ visible: true, title, message })
  }

  async function pickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showAlert('Permission needed', 'Allow access to your photo library to change your profile picture.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    })
    if (!result.canceled && result.assets[0]) {
      setEditorUri(result.assets[0].uri)
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      showAlert('Permission needed', 'Allow camera access to take a profile picture.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 })
    if (!result.canceled && result.assets[0]) {
      setEditorUri(result.assets[0].uri)
    }
  }

  async function doUpload(uri: string) {
    if (!authUser) return
    setLocalAvatarUri(uri)
    setUploading(true)
    try {
      await uploadAvatar(authUser.uid, uri)
    } catch (e: any) {
      console.error('Avatar upload error:', e?.code, e?.message, e)
      setLocalAvatarUri(null)
      showAlert('Upload failed', e?.message ?? 'Could not update your profile picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleAvatarPress() {
    setPhotoSheet(true)
  }

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.loadingCenter}>
        <Ionicons name="person-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.loadingText}>Setting up your profile…</Text>
        <ActivityIndicator color={Colors.primary} size="small" style={{ marginTop: 12 }} />
      </View>
    )
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {uploading && (
        <View style={styles.uploadBanner}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.uploadBannerText}>Uploading photo… don't navigate away</Text>
        </View>
      )}

      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.iconBtn, uploading && styles.btnDisabled]}
          onPress={() => { if (!uploading) router.push('/settings') }}
        >
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarWrap} onPress={handleAvatarPress} activeOpacity={0.8}>
          <Image
            source={
              localAvatarUri
                ? { uri: localAvatarUri }
                : profile.avatarUrl
                  ? { uri: profile.avatarUrl }
                  : require('@/assets/images/icon.png')
            }
            style={styles.avatar}
            cachePolicy="none"
          />
          {uploading ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : (
            <View style={styles.editAvatarBtn}>
              <Ionicons name="camera-outline" size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.statsRow}>
          <Stat label="Entries"   value={profile.entriesCount}   icon="musical-notes-outline" />
          <View style={styles.statDivider} />
          <Stat label="Followers" value={profile.followersCount} icon="people-outline" />
          <View style={styles.statDivider} />
          <Stat label="Following" value={profile.followingCount} icon="person-add-outline" />
        </View>

        <TouchableOpacity
          style={[styles.editBtn, uploading && styles.btnDisabled]}
          onPress={() => { if (!uploading) router.push('/settings') }}
        >
          <Ionicons name="create-outline" size={15} color={Colors.text} />
          <Text style={styles.editBtnText}>Edit profile</Text>
        </TouchableOpacity>
      </View>

      {profile.topFourSongs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={15} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Top Songs</Text>
          </View>
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
        <Ionicons name="list-outline" size={18} color={Colors.primary} />
        <Text style={styles.playlistsBtnText}>Memory Playlists</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="grid-outline" size={15} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Entries</Text>
        </View>
        {entries.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="musical-note-outline" size={36} color={Colors.surfaceAlt} />
            <Text style={styles.emptyText}>No public entries yet</Text>
          </View>
        )}
        {entries.map(e => <EntryCard key={e.id} entry={e} />)}
      </View>

    </ScrollView>

      {editorUri && (
        <ImageEditor
          visible
          uri={editorUri}
          onDone={(edited) => { setEditorUri(null); doUpload(edited) }}
          onCancel={() => setEditorUri(null)}
        />
      )}

      <AppModal
        visible={photoSheet}
        onClose={() => setPhotoSheet(false)}
        title="Profile Photo"
        variant="sheet"
        buttons={[
          { label: 'Take Photo',          onPress: takePhoto },
          { label: 'Choose from Library', onPress: pickFromLibrary },
          { label: 'Cancel', style: 'cancel' },
        ]}
      />

      <AppModal
        visible={alertModal.visible}
        onClose={() => setAlertModal(a => ({ ...a, visible: false }))}
        title={alertModal.title}
        message={alertModal.message}
        buttons={[{ label: 'OK' }]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  uploadBanner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.surface, paddingVertical: 10, paddingTop: 54 },
  uploadBannerText: { color: Colors.textSecondary, fontSize: 13 },
  btnDisabled:      { opacity: 0.4 },
  loadingCenter:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 10 },
  loadingText:    { color: Colors.textMuted, fontSize: 14 },
  container:      { flex: 1, backgroundColor: Colors.background },
  scroll:         { paddingBottom: 100 },
  topBar:         { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  iconBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  header:         { alignItems: 'center', paddingBottom: 24, paddingHorizontal: 16 },
  avatarWrap:     { position: 'relative', width: 88, height: 88 },
  avatar:         { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.surfaceAlt },
  avatarOverlay:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 44, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  editAvatarBtn:  { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.background },
  displayName:    { color: Colors.text, fontSize: 22, fontWeight: '700', marginTop: 12 },
  username:       { color: Colors.textSecondary, fontSize: 14, marginTop: 2 },
  bio:            { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  statsRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 0 },
  stat:           { alignItems: 'center', paddingHorizontal: 20 },
  statIcon:       { marginBottom: 4 },
  statValue:      { color: Colors.text, fontSize: 18, fontWeight: '700' },
  statLabel:      { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  statDivider:    { width: 1, height: 36, backgroundColor: Colors.border },
  editBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  editBtnText:    { color: Colors.text, fontSize: 14 },
  section:        { paddingHorizontal: 0, marginTop: 8 },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:   { color: Colors.text, fontSize: 15, fontWeight: '700' },
  topFourGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  topFourCard:    { width: '47%', backgroundColor: Colors.surface, borderRadius: 12, padding: 10 },
  topFourArt:     { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: Colors.surfaceAlt },
  topFourTrack:   { color: Colors.text, fontSize: 13, fontWeight: '600', marginTop: 8 },
  topFourArtist:  { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  topFourLyric:   { color: Colors.primary, fontSize: 11, fontStyle: 'italic', marginTop: 6, lineHeight: 15 },
  playlistsBtn:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 16, marginBottom: 8, backgroundColor: Colors.surface, borderRadius: 12, padding: 14 },
  playlistsBtnText:{ color: Colors.primary, fontWeight: '600', fontSize: 14 },
  emptyWrap:      { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText:      { color: Colors.textMuted, fontSize: 14 },
})
