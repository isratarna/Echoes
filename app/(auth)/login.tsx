import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native'
import { Link } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { loginWithEmail, loginWithGoogle } from '@/services/firebase/auth'
import { Colors } from '@/constants/colors'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const [, response, promptAsync] = Google.useAuthRequest({
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  })

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params
      loginWithGoogle(id_token).catch(() => setError('Google sign-in failed'))
    }
  }, [response])

  async function handleLogin() {
    if (!email.trim() || !password) { setError('Email and password required'); return }
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email.trim(), password)
    } catch {
      setError('Invalid email or password')
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
        <Text style={styles.logo}>Echoes</Text>
        <Text style={styles.tagline}>Your music. Your story.</Text>

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
          placeholder="Password"
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Sign in</Text>
          }
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={() => promptAsync()}>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <Link href="/(auth)/register" style={styles.link}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign up</Text></Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner:     { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logo:      { color: Colors.text, fontSize: 40, fontWeight: '800', textAlign: 'center', letterSpacing: -1 },
  tagline:   { color: Colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: 6, marginBottom: 40 },
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
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 16 },
  divider:      { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine:  { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText:  { color: Colors.textMuted, marginHorizontal: 12, fontSize: 13 },
  googleBtn: {
    backgroundColor: Colors.surface,
    borderRadius:    10,
    paddingVertical: 15,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  googleBtnText: { color: Colors.text, fontWeight: '600', fontSize: 16 },
  link:          { marginTop: 24, alignSelf: 'center' },
  linkText:      { color: Colors.textMuted, fontSize: 14 },
  linkAccent:    { color: Colors.primary, fontWeight: '600' },
})
