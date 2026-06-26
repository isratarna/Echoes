import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { registerWithEmail } from '@/services/firebase/auth'
import { Colors } from '@/constants/colors'

export default function RegisterScreen() {
  const [username,     setUsername]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  async function handleRegister() {
    if (!username.trim())     { setError('Username is required'); return }
    if (!email.trim())        { setError('Email is required');    return }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return }

    setError(''); setLoading(true)
    try {
      await registerWithEmail(email.trim(), password, username.trim().toLowerCase())
    } catch (e: any) {
      if (e?.code === 'auth/email-already-in-use') setError('Email already in use')
      else setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start your music journal</Text>
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="at-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={Colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.error} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Create account</Text>
          }
        </TouchableOpacity>

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account?{'  '}<Text style={styles.linkAccent}>Sign in</Text>
          </Text>
        </Link>

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  inner:       { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  titleBlock:  { marginBottom: 32 },
  title:       { color: Colors.text, fontSize: 32, fontWeight: '800' },
  subtitle:    { color: Colors.textMuted, fontSize: 15, marginTop: 4 },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 },
  inputIcon:   { marginRight: 10 },
  input:       { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 14 },
  eyeBtn:      { padding: 4 },
  errorWrap:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  error:       { color: Colors.error, fontSize: 13 },
  btn:         { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
  link:        { marginTop: 24, alignSelf: 'center' },
  linkText:    { color: Colors.textMuted, fontSize: 14 },
  linkAccent:  { color: Colors.primary, fontWeight: '600' },
})
