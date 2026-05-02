import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Pollen Tracker</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <Link href="/auth/register" style={styles.link}>
        Don't have an account? Register
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13', justifyContent: 'center', padding: 28 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8e8f0', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#1c1c24', color: '#e8e8f0', borderRadius: 10, padding: 14,
    fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a38',
  },
  button: {
    backgroundColor: '#4CAF50', borderRadius: 10, padding: 15,
    alignItems: 'center', marginTop: 6,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  error: { color: '#f87171', marginBottom: 12, textAlign: 'center' },
  link: { color: '#4CAF50', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
