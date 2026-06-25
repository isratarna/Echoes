import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native'
import { Image } from 'expo-image'
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

export default function CreateScreen() {
  const { authUser, profile } = useAuth()
  const spotify = useSpotifySearch()

  const [step,      setStep]      = useState<Step>('search')
  const [track,     setTrack]     = useState<SpotifyTrack | null>(null)
  const [lyric,     setLyric]     = useState('')
  const [meaning,   setMeaning]   = useState('')
  const [rating,    setRating]    = useState<number | null>(null)
  const [visibility,setVisibility]= useState<Visibility>('public')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  function reset() {
    setStep('search')
    setTrack(null)
    setLyric('')
    setMeaning('')
    setRating(null)
    setVisibility('public')
    spotify.setInput('')
  }

  async function handleSave() {
    if (!authUser || !profile || !track) return
    if (!lyric.trim())   { setError('Lyric highlight is required');   return }
    if (!meaning.trim()) { setError('Emotional meaning is required'); return }

    setError('')
    setSaving(true)
    try {
      await createEntry(
        authUser.uid,
        profile.username,
        profile.avatarUrl,
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

  // ── Step 1: Search ──────────────────────────────────────────────────────────

  if (step === 'search') {
    return (
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Log a song</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search for a song..."
          placeholderTextColor={Colors.textMuted}
          value={spotify.input}
          onChangeText={spotify.setInput}
          autoFocus
          clearButtonMode="while-editing"
        />

        {spotify.loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}

        <FlatList
          data={spotify.results}
          keyExtractor={(t) => t.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.trackRow}
              onPress={() => { setTrack(item); setStep('compose') }}
            >
              <Image source={{ uri: item.album.images.at(-1)?.url }} style={styles.thumbArt} />
              <View style={styles.trackRowText}>
                <Text style={styles.trackRowName}   numberOfLines={1}>{item.name}</Text>
                <Text style={styles.trackRowArtist} numberOfLines={1}>
                  {item.artists.map(a => a.name).join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            spotify.input.length >= 2 && !spotify.loading
              ? <Text style={styles.empty}>No results</Text>
              : null
          }
        />
      </View>
    )
  }

  // ── Step 2: Compose ─────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.composeScroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => setStep('search')} style={styles.backBtn}>
          <Text style={styles.backText}>← Change song</Text>
        </TouchableOpacity>

        {track && (
          <View style={styles.selectedTrack}>
            <Image source={{ uri: track.album.images[0]?.url }} style={styles.selectedArt} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}   numberOfLines={1}>{track.name}</Text>
              <Text style={styles.selectedArtist} numberOfLines={1}>
                {track.artists.map(a => a.name).join(', ')}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>Lyric highlight <Text style={styles.required}>*</Text></Text>
        <View style={styles.lyricInputContainer}>
          <Text style={styles.lyricQuote}>"</Text>
          <TextInput
            style={styles.lyricInput}
            placeholder="The line that stuck with you..."
            placeholderTextColor={Colors.textMuted}
            value={lyric}
            onChangeText={setLyric}
            multiline
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>{lyric.length}/500</Text>

        <Text style={styles.label}>What does it mean to you <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.meaningInput}
          placeholder="Why does this song hit different..."
          placeholderTextColor={Colors.textMuted}
          value={meaning}
          onChangeText={setMeaning}
          multiline
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{meaning.length}/1000</Text>

        <Text style={styles.label}>Rating (optional)</Text>
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

        <View style={styles.visibilityRow}>
          {(['public', 'private'] as Visibility[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.visBtn, visibility === v && styles.visBtnActive]}
              onPress={() => setVisibility(v)}
            >
              <Text style={[styles.visBtnText, visibility === v && styles.visBtnTextActive]}>
                {v === 'public' ? '🌍 Public' : '🔒 Private'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save entry</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  screenTitle:   { color: Colors.text, fontSize: 24, fontWeight: '700', paddingHorizontal: 16, marginBottom: 16 },
  searchInput: {
    backgroundColor: Colors.surface, color: Colors.text, fontSize: 16,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 16, marginBottom: 8,
  },
  trackRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  thumbArt:        { width: 44, height: 44, borderRadius: 6, backgroundColor: Colors.surfaceAlt },
  trackRowText:    { flex: 1, marginLeft: 12 },
  trackRowName:    { color: Colors.text, fontSize: 14, fontWeight: '500' },
  trackRowArtist:  { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  empty:           { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  composeScroll:   { paddingHorizontal: 16, paddingBottom: 100 },
  backBtn:         { marginBottom: 20 },
  backText:        { color: Colors.primary, fontSize: 15 },
  selectedTrack: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 24,
  },
  selectedArt:    { width: 56, height: 56, borderRadius: 8, backgroundColor: Colors.surfaceAlt, marginRight: 12 },
  selectedName:   { color: Colors.text, fontSize: 16, fontWeight: '600' },
  selectedArtist: { color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
  label:          { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 20 },
  required:       { color: Colors.primary },
  lyricInputContainer: {
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
    backgroundColor: Colors.surface, borderRadius: 8, padding: 12,
  },
  lyricQuote:  { color: Colors.primary, fontSize: 28, fontWeight: '700', lineHeight: 24, marginBottom: 4 },
  lyricInput:  { color: Colors.text, fontSize: 15, fontStyle: 'italic', lineHeight: 22, minHeight: 60 },
  meaningInput: {
    backgroundColor: Colors.surface, color: Colors.text, fontSize: 14,
    borderRadius: 10, padding: 12, lineHeight: 21, minHeight: 100,
  },
  charCount:       { color: Colors.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
  ratingRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingBtn:       { width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  ratingBtnActive: { backgroundColor: Colors.primary },
  ratingBtnText:   { color: Colors.textSecondary, fontWeight: '600' },
  ratingBtnTextActive: { color: '#fff' },
  visibilityRow:   { flexDirection: 'row', gap: 12, marginTop: 8 },
  visBtn:          { flex: 1, padding: 12, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center' },
  visBtnActive:    { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.primary },
  visBtnText:      { color: Colors.textSecondary, fontSize: 14 },
  visBtnTextActive:{ color: Colors.text, fontWeight: '600' },
  error:           { color: Colors.error, fontSize: 13, marginTop: 12, textAlign: 'center' },
  saveBtn:         { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
})
