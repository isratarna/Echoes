import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSpotifySearch } from '@/hooks/useSpotifySearch'
import { useAuth } from '@/contexts/AuthContext'
import { createEntry } from '@/services/firebase/entries'
import { Colors } from '@/constants/colors'
import type { SpotifyTrack, SpotifyTrackRef, Visibility } from '@/types'

type Step = 'search' | 'compose'

function toTrackRef(t: SpotifyTrack): SpotifyTrackRef {
  return {
    spotifyTrackId: t.id,
    trackName:      t.name,
    artistName:     t.artists.map(a => a.name).join(', '),
    albumName:      t.album.name,
    albumArtUrl:    t.album.images[0]?.url ?? '',
    spotifyUrl:     t.external_urls.spotify,
  }
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, styles.stepDotActive]}>
        <Text style={styles.stepDotText}>1</Text>
      </View>
      <View style={[styles.stepLine, step === 'compose' && styles.stepLineActive]} />
      <View style={[styles.stepDot, step === 'compose' && styles.stepDotActive]}>
        <Text style={[styles.stepDotText, step !== 'compose' && styles.stepDotTextInactive]}>2</Text>
      </View>
    </View>
  )
}

export default function CreateScreen() {
  const { authUser, profile } = useAuth()
  const spotify = useSpotifySearch()

  const [step,       setStep]       = useState<Step>('search')
  const [track,      setTrack]      = useState<SpotifyTrack | null>(null)
  const [lyric,      setLyric]      = useState('')
  const [meaning,    setMeaning]    = useState('')
  const [rating,     setRating]     = useState<number | null>(null)
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  function reset() {
    setStep('search'); setTrack(null); setLyric(''); setMeaning('')
    setRating(null); setVisibility('public'); spotify.setInput('')
  }

  async function handleSave() {
    if (!authUser || !profile || !track) return
    if (!lyric.trim())   { setError('Lyric highlight is required');   return }
    if (!meaning.trim()) { setError('Emotional meaning is required'); return }
    setError(''); setSaving(true)
    try {
      await createEntry(
        authUser.uid, profile.username, profile.avatarUrl,
        toTrackRef(track),
        { lyricHighlight: lyric.trim(), emotionalMeaning: meaning.trim(), rating, visibility }
      )
      reset()
      router.replace('/(tabs)/')
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Step 1: Search ───────────────────────────────────────────────────────────

  if (step === 'search') {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Log a Song</Text>
          <StepIndicator step="search" />
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a song…"
            placeholderTextColor={Colors.textMuted}
            value={spotify.input}
            onChangeText={spotify.setInput}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>

        {spotify.loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />}

        <FlatList
          data={spotify.results}
          keyExtractor={(t) => t.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackRow}
              activeOpacity={0.75}
              onPress={() => { setTrack(item); setStep('compose') }}
            >
              <Image source={{ uri: item.album.images.at(-1)?.url }} style={styles.thumbArt} />
              <View style={styles.trackRowText}>
                <Text style={styles.trackRowName}   numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackRowArtist} numberOfLines={1}>
                  {item.artists.map(a => a.name).join(', ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            spotify.input.length >= 2 && !spotify.loading ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={36} color={Colors.textMuted} />
                <Text style={styles.empty}>No results</Text>
              </View>
            ) : spotify.input.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="headset-outline" size={52} color={Colors.surfaceAlt} />
                <Text style={styles.emptyHint}>Search for the song{'\n'}you want to journal about</Text>
              </View>
            ) : null
          }
        />
      </View>
    )
  }

  // ── Step 2: Compose ──────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.composeScroll} keyboardShouldPersistTaps="handled">

        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Your Entry</Text>
          <StepIndicator step="compose" />
        </View>

        <TouchableOpacity onPress={() => setStep('search')} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={16} color={Colors.primary} />
          <Text style={styles.backText}>Change song</Text>
        </TouchableOpacity>

        {track && (
          <View style={styles.selectedTrack}>
            <Image source={{ uri: track.album.images[0]?.url }} style={styles.selectedArt} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}   numberOfLines={1}>{track.name}</Text>
              <Text style={styles.selectedArtist} numberOfLines={1}>
                {track.artists.map(a => a.name).join(', ')}
              </Text>
              <Text style={styles.selectedAlbum}  numberOfLines={1}>{track.album.name}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={Colors.spotify} />
          </View>
        )}

        <View style={styles.fieldLabel}>
          <Ionicons name="musical-note-outline" size={15} color={Colors.primary} />
          <Text style={styles.label}>Lyric highlight <Text style={styles.required}>*</Text></Text>
        </View>
        <View style={styles.lyricInputContainer}>
          <Text style={styles.lyricQuote}>"</Text>
          <TextInput
            style={styles.lyricInput}
            placeholder="The line that stuck with you…"
            placeholderTextColor={Colors.textMuted}
            value={lyric}
            onChangeText={setLyric}
            multiline
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>{lyric.length}/500</Text>

        <View style={styles.fieldLabel}>
          <Ionicons name="heart-outline" size={15} color={Colors.primary} />
          <Text style={styles.label}>What does it mean to you <Text style={styles.required}>*</Text></Text>
        </View>
        <TextInput
          style={styles.meaningInput}
          placeholder="Why does this song hit different…"
          placeholderTextColor={Colors.textMuted}
          value={meaning}
          onChangeText={setMeaning}
          multiline
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{meaning.length}/1000</Text>

        <View style={styles.fieldLabel}>
          <Ionicons name="star-outline" size={15} color={Colors.primary} />
          <Text style={styles.label}>Rating <Text style={styles.optional}>(optional)</Text></Text>
        </View>
        <View style={styles.ratingRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.ratingBtn, rating === n && styles.ratingBtnActive]}
              onPress={() => setRating(prev => prev === n ? null : n)}
            >
              <Text style={[styles.ratingBtnText, rating === n && styles.ratingBtnTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.fieldLabel}>
          <Ionicons name="eye-outline" size={15} color={Colors.primary} />
          <Text style={styles.label}>Visibility</Text>
        </View>
        <View style={styles.visibilityRow}>
          {(['public', 'private'] as Visibility[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.visBtn, visibility === v && styles.visBtnActive]}
              onPress={() => setVisibility(v)}
            >
              <Ionicons
                name={v === 'public' ? 'globe-outline' : 'lock-closed-outline'}
                size={16}
                color={visibility === v ? Colors.text : Colors.textMuted}
              />
              <Text style={[styles.visBtnText, visibility === v && styles.visBtnTextActive]}>
                {v === 'public' ? 'Public' : 'Private'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save entry</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  screenHeader: { paddingHorizontal: 16, marginBottom: 16 },
  screenTitle:  { color: Colors.text, fontSize: 26, fontWeight: '800', marginBottom: 12 },
  stepRow:      { flexDirection: 'row', alignItems: 'center' },
  stepDot:      { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  stepDotActive:{ backgroundColor: Colors.primary },
  stepDotText:  { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepDotTextInactive: { color: Colors.textMuted },
  stepLine:     { flex: 0, width: 32, height: 2, backgroundColor: Colors.surfaceAlt, marginHorizontal: 4 },
  stepLineActive:{ backgroundColor: Colors.primary },
  searchWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12 },
  searchIcon:   { marginRight: 8 },
  searchInput:  { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 13 },
  trackRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  thumbArt:     { width: 46, height: 46, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  trackRowText: { flex: 1, marginLeft: 12 },
  trackRowName: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  trackRowArtist:{ color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  emptyWrap:    { alignItems: 'center', marginTop: 60, gap: 12 },
  empty:        { color: Colors.textMuted, fontSize: 14 },
  emptyHint:    { color: Colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  composeScroll:{ paddingHorizontal: 16, paddingBottom: 100 },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText:     { color: Colors.primary, fontSize: 15 },
  selectedTrack:{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 20, gap: 12 },
  selectedArt:  { width: 54, height: 54, borderRadius: 8, backgroundColor: Colors.surfaceAlt },
  selectedName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  selectedArtist:{ color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  selectedAlbum:{ color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  fieldLabel:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 20 },
  label:        { color: Colors.text, fontSize: 14, fontWeight: '600' },
  required:     { color: Colors.primary },
  optional:     { color: Colors.textMuted, fontWeight: '400' },
  lyricInputContainer: { borderLeftWidth: 3, borderLeftColor: Colors.primary, backgroundColor: Colors.surface, borderRadius: 8, padding: 12 },
  lyricQuote:   { color: Colors.primary, fontSize: 28, fontWeight: '700', lineHeight: 24, marginBottom: 4 },
  lyricInput:   { color: Colors.text, fontSize: 15, fontStyle: 'italic', lineHeight: 22, minHeight: 60 },
  meaningInput: { backgroundColor: Colors.surface, color: Colors.text, fontSize: 14, borderRadius: 10, padding: 12, lineHeight: 21, minHeight: 100 },
  charCount:    { color: Colors.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  ratingRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingBtn:    { width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  ratingBtnActive:{ backgroundColor: Colors.primary },
  ratingBtnText:{ color: Colors.textSecondary, fontWeight: '600' },
  ratingBtnTextActive:{ color: '#fff' },
  visibilityRow:{ flexDirection: 'row', gap: 12 },
  visBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, borderRadius: 10, backgroundColor: Colors.surface },
  visBtnActive: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.primary },
  visBtnText:   { color: Colors.textMuted, fontSize: 14 },
  visBtnTextActive:{ color: Colors.text, fontWeight: '600' },
  errorWrap:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  error:        { color: Colors.error, fontSize: 13 },
  saveBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, padding: 16, marginTop: 24 },
  saveBtnDisabled:{ opacity: 0.6 },
  saveBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
})
