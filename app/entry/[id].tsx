import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native'
import { AppModal } from '@/components/ui/AppModal'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
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
  const [loading,       setLoading]       = useState(true)
  const [deleteVisible, setDeleteVisible] = useState(false)

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

  function handleDelete() {
    if (!entry || !authUser) return
    setDeleteVisible(true)
  }

  async function confirmDelete() {
    if (!entry || !authUser) return
    await deleteEntry(entry.id, authUser.uid)
    router.back()
  }

  const isOwner = authUser?.uid === entry?.userId

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
  }
  if (!entry) {
    return (
      <View style={styles.center}>
        <Ionicons name="musical-note-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.notFound}>Entry not found.</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.nav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          {isOwner && (
            <View style={styles.navActions}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.push(`/entry/edit/${entry.id}`)}>
                <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
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
            activeOpacity={0.8}
            onPress={() => Linking.openURL(entry.spotifyUrl)}
          >
            <Ionicons name="musical-notes" size={16} color="#fff" />
            <Text style={styles.spotifyBtnText}>Open in Spotify</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Image source={{ uri: entry.userAvatarUrl }} style={styles.avatar} />
          <TouchableOpacity onPress={() => router.push(`/user/${entry.userId}`)}>
            <Text style={styles.username}>{entry.username}</Text>
          </TouchableOpacity>
          {entry.rating != null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={Colors.rating} />
              <Text style={styles.rating}>{entry.rating}/10</Text>
            </View>
          )}
          {entry.visibility === 'private' && (
            <View style={styles.privateBadge}>
              <Ionicons name="lock-closed-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.privateBadgeText}>Private</Text>
            </View>
          )}
        </View>

        <View style={styles.contentSection}>
          <LyricHighlight text={entry.lyricHighlight} />
          <Text style={styles.meaningLabel}>What it means</Text>
          <Text style={styles.meaning}>{entry.emotionalMeaning}</Text>
        </View>

        <TouchableOpacity style={styles.likeBtn} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={26}
            color={liked ? Colors.error : Colors.textMuted}
          />
          <Text style={[styles.likeCount, liked && styles.likeCountActive]}>{likeCount}</Text>
        </TouchableOpacity>

        {entry.visibility === 'public' && (
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <Ionicons name="chatbubbles-outline" size={17} color={Colors.text} />
              <Text style={styles.commentsLabel}>Comments</Text>
              <Text style={styles.commentsCount}>{comments.length}</Text>
            </View>
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
              <Text style={styles.noComments}>No comments yet. Be the first.</Text>
            )}
          </View>
        )}

      </ScrollView>

      {entry.visibility === 'public' && (
        <View style={styles.commentInputRow}>
          <Image source={{ uri: profile?.avatarUrl }} style={styles.commentInputAvatar} />
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment…"
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
              : <Ionicons name="send" size={16} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      )}
      <AppModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        title="Delete entry"
        message="This cannot be undone."
        buttons={[
          { label: 'Cancel', style: 'cancel' },
          { label: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12 },
  notFound:       { color: Colors.textMuted, fontSize: 16 },
  scroll:         { paddingBottom: 120 },
  nav:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 60, paddingBottom: 12 },
  navBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  navActions:     { flexDirection: 'row', gap: 8 },
  albumArt:       { width: '100%', aspectRatio: 1, backgroundColor: Colors.surfaceAlt },
  trackSection:   { paddingHorizontal: 16, paddingTop: 16 },
  trackName:      { color: Colors.text, fontSize: 22, fontWeight: '700' },
  artistName:     { color: Colors.textSecondary, fontSize: 15, marginTop: 4 },
  spotifyBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, backgroundColor: Colors.spotify, borderRadius: 10, paddingVertical: 11 },
  spotifyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  metaRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, gap: 8 },
  avatar:         { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceAlt },
  username:       { color: Colors.text, fontWeight: '600', fontSize: 14, flex: 1 },
  ratingBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating:         { color: Colors.rating, fontWeight: '700', fontSize: 13 },
  privateBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  privateBadgeText:{ color: Colors.textMuted, fontSize: 12 },
  contentSection: { paddingHorizontal: 16, marginTop: 8 },
  meaningLabel:   { color: Colors.textMuted, fontSize: 11, fontWeight: '600', marginTop: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
  meaning:        { color: Colors.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 6 },
  likeBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 16, marginTop: 4 },
  likeCount:      { color: Colors.textMuted, fontSize: 16, fontWeight: '600' },
  likeCountActive:{ color: Colors.error },
  commentsSection:{ paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 16 },
  commentsLabel:  { color: Colors.text, fontSize: 16, fontWeight: '700' },
  commentsCount:  { color: Colors.textMuted, fontSize: 14 },
  commentRow:     { flexDirection: 'row', marginBottom: 16 },
  commentAvatar:  { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceAlt },
  commentContent: { flex: 1, marginLeft: 10 },
  commentUsername:{ color: Colors.text, fontWeight: '600', fontSize: 13 },
  commentText:    { color: Colors.textSecondary, fontSize: 14, marginTop: 3, lineHeight: 20 },
  noComments:     { color: Colors.textMuted, fontSize: 14 },
  commentInputRow:{
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background,
  },
  commentInputAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.surfaceAlt },
  commentInput:   { flex: 1, backgroundColor: Colors.surface, color: Colors.text, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  postBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  postBtnDisabled:{ opacity: 0.4 },
})
