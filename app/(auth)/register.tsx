import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native'
import { Link } from 'expo-router'
import { registerWithEmail } from '@/services/firebase/auth'
import { Colors } from '@/constants/colors'

export default function RegisterScreen() {
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleRegister() {
    if (!username.trim()) { setError('Username is required'); return }
    if (!email.trim())    { setError('Email is required');    return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setError('')
    setLoading(true)
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start your music journal</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={Colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Create account</Text>
          }
        </TouchableOpacity>

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner:     { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title:     { color: Colors.text, fontSize: 32, fontWeight: '800', marginBottom: 6 },
  subtitle:  { color: Colors.textMuted, fontSize: 15, marginBottom: 36 },
  input: {
    backgroundColor: Colors.surface,
    color:           Colors.text,
    borderRadius:    10,
    paddingHorizontal: 16,
    paddingVertical:   14,
    fontSize:        16,
    marginBottom:    12,
  },
  error:   { color: Colors.error, fontSize: 13, textAlign: 'center', marginBottom: 8 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius:    10,
    paddingVertical: 15,
    alignItems:      'center',
    marginTop:       4,
  },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
  link:      { marginTop: 24, alignSelf: 'center' },
  linkText:  { color: Colors.textMuted, fontSize: 14 },
  linkAccent:{ color: Colors.primary, fontWeight: '600' },
})
