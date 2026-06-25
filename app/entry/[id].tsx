import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, router } from 'expo-router'
import * as Linking from 'expo-linking'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase/config'
import {
  toggleLike, addComment, deleteEntry,
  subscribeComments, checkLiked,
} from '@/services/firebase/entries'
import { LyricHighlight } from '@/components/entry/LyricHighlight'
import { useAuth } from '@/contexts/AuthContext'
import { Colors } from '@/constants/colors'
import type { SongEntry, Comment } from '@/types'

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { authUser, profile } = useAuth()

  const [entry,       setEntry]       = useState<SongEntry | null>(null)
  const [comments,    setComments]    = useState<Comment[]>([])
  const [liked,       setLiked]       = useState(false)
  const [likeCount,   setLikeCount]   = useState(0)
  const [commentText, setCommentText] = useState('')
  const [posting,     setPosting]     = useState(false)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!id) return

    getDoc(doc(db, 'entries', id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as SongEntry
        setEntry(data)
        setLikeCount(data.likesCount)
      }
      setLoading(false)
    })

    if (authUser) checkLiked(id, authUser.uid).then(setLiked)

    return subscribeComments(id, setComments)
  }, [id, authUser?.uid])

  async function handleLike() {
    if (!authUser || !id) return
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(c => wasLiked ? c - 1 : c + 1)
    try {
      await toggleLike(id, authUser.uid, wasLiked)
    } catch {
      setLiked(wasLiked)
      setLikeCount(c => wasLiked ? c + 1 : c - 1)
    }
  }

  async function handleComment() {
    if (!commentText.trim() || !authUser || !profile || !id) return
    setPosting(true)
    try {
      await addComment(id, authUser.uid, profile.username, profile.avatarUrl, commentText.trim())
      setCommentText('')
    } finally {
      setPosting(false)
    }
  }

  async function handleDelete() {
    if (!entry || !authUser) return
    Alert.alert('Delete entry', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteEntry(entry.id, authUser.uid)
          router.back()
        },
      },
    ])
  }

  const isOwner = authUser?.uid === entry?.userId

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
  }
  if (!entry) {
    return <View style={styles.center}><Text style={styles.notFound}>Entry not found.</Text></View>
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.navBack}>← Back</Text>
          </TouchableOpacity>
          {isOwner && (
            <View style={styles.navActions}>
              <TouchableOpacity onPress={() => router.push(`/entry/edit/${entry.id}`)}>
                <Text style={styles.navEdit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={styles.navDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Image source={{ uri: entry.albumArtUrl }} style={styles.albumArt} />

        <View style={styles.trackSection}>
          <Text style={styles.trackName}>{entry.trackName}</Text>
          <Text style={styles.artistName}>{entry.artistName} · {entry.albumName}</Text>

          <TouchableOpacity
            style={styles.spotifyBtn}
            onPress={() => Linking.openURL(entry.spotifyUrl)}
          >
            <Text style={styles.spotifyBtnText}>▶ Open in Spotify</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Image source={{ uri: entry.userAvatarUrl }} style={styles.avatar} />
          <TouchableOpacity onPress={() => router.push(`/user/${entry.userId}`)}>
            <Text style={styles.username}>{entry.username}</Text>
          </TouchableOpacity>
          {entry.rating != null && (
            <Text style={styles.rating}>{entry.rating}/10</Text>
          )}
          {entry.visibility === 'private' && (
            <Text style={styles.privateBadge}>🔒 Private</Text>
          )}
        </View>

        <View style={styles.contentSection}>
          <LyricHighlight text={entry.lyricHighlight} />

          <Text style={styles.meaningLabel}>What it means</Text>
          <Text style={styles.meaning}>{entry.emotionalMeaning}</Text>
        </View>

        <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
          <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>
            {liked ? '♥' : '♡'}
          </Text>
          <Text style={styles.likeCount}>{likeCount}</Text>
        </TouchableOpacity>

        {entry.visibility === 'public' && (
          <View style={styles.commentsSection}>
            <Text style={styles.commentsLabel}>Comments</Text>
            {comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <Image source={{ uri: c.userAvatarUrl }} style={styles.commentAvatar} />
                <View style={styles.commentContent}>
                  <Text style={styles.commentUsername}>{c.username}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
            {comments.length === 0 && (
              <Text style={styles.noComments}>No comments yet.</Text>
            )}
          </View>
        )}

      </ScrollView>

      {entry.visibility === 'public' && (
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.postBtn, (!commentText.trim() || posting) && styles.postBtnDisabled]}
            onPress={handleComment}
            disabled={!commentText.trim() || posting}
          >
            {posting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.postBtnText}>Post</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  notFound:     { color: Colors.textMuted, fontSize: 16 },
  scroll:       { paddingBottom: 120 },
  nav:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  navBack:      { color: Colors.primary, fontSize: 16 },
  navActions:   { flexDirection: 'row', gap: 16 },
  navEdit:      { color: Colors.textSecondary, fontSize: 15 },
  navDelete:    { color: Colors.error, fontSize: 15 },
  albumArt:     { width: '100%', aspectRatio: 1, backgroundColor: Colors.surfaceAlt },
  trackSection: { paddingHorizontal: 16, paddingTop: 16 },
  trackName:    { color: Colors.text, fontSize: 22, fontWeight: '700' },
  artistName:   { color: Colors.textSecondary, fontSize: 15, marginTop: 4 },
  spotifyBtn:   { marginTop: 12, backgroundColor: Colors.spotify, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  spotifyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  metaRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, gap: 8 },
  avatar:       { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceAlt },
  username:     { color: Colors.text, fontWeight: '600', fontSize: 14, flex: 1 },
  rating:       { color: Colors.rating, fontWeight: '700' },
  privateBadge: { color: Colors.textMuted, fontSize: 12 },
  contentSection: { paddingHorizontal: 16, marginTop: 8 },
  meaningLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
  meaning:      { color: Colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 6 },
  likeBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 16, marginTop: 8 },
  likeIcon:     { fontSize: 22, color: Colors.textMuted },
  likeIconActive: { color: Colors.error },
  likeCount:    { color: Colors.textMuted, fontSize: 15 },
  commentsSection: { paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 },
  commentsLabel:{ color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  commentRow:   { flexDirection: 'row', marginBottom: 16 },
  commentAvatar:{ width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.surfaceAlt },
  commentContent:{ flex: 1, marginLeft: 10 },
  commentUsername: { color: Colors.text, fontWeight: '600', fontSize: 13 },
  commentText:  { color: Colors.textSecondary, fontSize: 14, marginTop: 3, lineHeight: 20 },
  noComments:   { color: Colors.textMuted, fontSize: 14 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background,
  },
  commentInput: { flex: 1, backgroundColor: Colors.surface, color: Colors.text, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  postBtn:      { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText:  { color: '#fff', fontWeight: '600', fontSize: 14 },
})
