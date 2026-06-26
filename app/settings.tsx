import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/firebase/users'
import { Colors } from '@/constants/colors'

export default function SettingsScreen() {
  const { authUser, profile } = useAuth()

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [bio,         setBio]         = useState(profile?.bio ?? '')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')

  async function handleSave() {
    if (!authUser) return
    if (!displayName.trim()) { setError('Display name is required'); return }
    setError('')
    setSaving(true)
    try {
      await updateProfile(authUser.uid, {
        displayName: displayName.trim(),
        bio: bio.trim(),
      })
      setSaved(true)
      setTimeout(() => router.back(), 700)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.form}>

          <View style={styles.group}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={t => { setDisplayName(t); setSaved(false) }}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              maxLength={50}
              autoCorrect={false}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Username</Text>
            <View style={[styles.input, styles.inputLocked]}>
              <Text style={styles.lockedText}>@{profile?.username}</Text>
              <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />
            </View>
            <Text style={styles.hint}>Username cannot be changed</Text>
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={t => { setBio(t); setSaved(false) }}
              placeholder="Write something about yourself…"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length} / 200</Text>
          </View>

          {!!error && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, (saving || saved) && styles.saveBtnDim]}
            onPress={handleSave}
            disabled={saving || saved}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : saved ? (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Saved!</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save changes</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: Colors.background },
  scroll:       { paddingBottom: 80 },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 60, paddingBottom: 20 },
  backBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  title:        { color: Colors.text, fontSize: 18, fontWeight: '700' },

  form:         { paddingHorizontal: 16, gap: 22 },
  group:        { gap: 8 },
  label:        { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  input:        { backgroundColor: Colors.surface, color: Colors.text, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: Colors.border },
  inputLocked:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: 0.55 },
  lockedText:   { color: Colors.textMuted, fontSize: 15 },
  inputMultiline:{ minHeight: 110, paddingTop: 14 },
  hint:         { color: Colors.textMuted, fontSize: 12 },
  charCount:    { color: Colors.textMuted, fontSize: 11, textAlign: 'right' },

  errorRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText:    { color: Colors.error, fontSize: 13 },

  saveBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, marginTop: 4 },
  saveBtnDim:   { opacity: 0.65 },
  saveBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
})
