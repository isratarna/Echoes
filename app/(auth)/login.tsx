import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet,
} from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { loginWithEmail, loginWithGoogle } from '@/services/firebase/auth'
import { Colors } from '@/constants/colors'

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

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
    setError(''); setLoading(true)
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

        <View style={styles.brand}>
          <View style={styles.logoMark}>
            <Ionicons name="headset" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.logo}>echoes</Text>
          <Text style={styles.tagline}>Your music. Your story.</Text>
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
            placeholder="Password"
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
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <Link href="/(auth)/register" style={styles.link}>
          <Text style={styles.linkText}>
            Don't have an account?{'  '}<Text style={styles.linkAccent}>Sign up</Text>
          </Text>
        </Link>

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  inner:       { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  brand:       { alignItems: 'center', marginBottom: 40 },
  logoMark:    { width: 68, height: 68, borderRadius: 20, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logo:        { color: Colors.text, fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  tagline:     { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12 },
  inputIcon:   { marginRight: 10 },
  input:       { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 14 },
  eyeBtn:      { padding: 4 },
  errorWrap:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  error:       { color: Colors.error, fontSize: 13 },
  btn:         { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, marginHorizontal: 12, fontSize: 13 },
  googleBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.surface, borderRadius: 12, paddingVertical: 15, borderWidth: 1, borderColor: Colors.border },
  googleG:     { color: '#4285F4', fontWeight: '800', fontSize: 18 },
  googleBtnText:{ color: Colors.text, fontWeight: '600', fontSize: 16 },
  link:        { marginTop: 24, alignSelf: 'center' },
  linkText:    { color: Colors.textMuted, fontSize: 14 },
  linkAccent:  { color: Colors.primary, fontWeight: '600' },
})
