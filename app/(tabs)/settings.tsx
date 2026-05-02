import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [label, setLabel] = useState('');
  const [useManual, setUseManual] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setProfile(data);
        setLat(data.manual_latitude?.toString() ?? '');
        setLon(data.manual_longitude?.toString() ?? '');
        setLabel(data.manual_location_label ?? '');
        setUseManual(data.use_manual_location);
      });
  }, [session]);

  async function save() {
    if (useManual && (!lat || !lon)) {
      Alert.alert('Missing fields', 'Enter latitude and longitude for manual location.');
      return;
    }
    setSaving(true);
    const update: Partial<UserProfile> = {
      use_manual_location: useManual,
      manual_latitude: lat ? parseFloat(lat) : null,
      manual_longitude: lon ? parseFloat(lon) : null,
      manual_location_label: label || null,
    };
    const { error } = await supabase
      .from('user_profiles')
      .update(update)
      .eq('id', session!.user.id);
    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Saved', 'Location settings updated.');
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Settings</Text>

      <Text style={styles.email}>{session?.user.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Use manual location</Text>
          <Switch
            value={useManual}
            onValueChange={setUseManual}
            trackColor={{ true: '#4CAF50', false: '#2a2a38' }}
            thumbColor="#fff"
          />
        </View>
        {useManual && (
          <>
            <TextInput style={styles.input} placeholder="Latitude (e.g. 55.676)" placeholderTextColor="#666"
              value={lat} onChangeText={setLat} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Longitude (e.g. 12.568)" placeholderTextColor="#666"
              value={lon} onChangeText={setLon} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Label (e.g. Copenhagen)" placeholderTextColor="#666"
              value={label} onChangeText={setLabel} />
          </>
        )}
        <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Location</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 24, paddingTop: 56 },
  heading: { fontSize: 20, color: '#e8e8f0', fontWeight: '600', marginBottom: 4 },
  email: { color: '#666', fontSize: 13, marginBottom: 28 },
  card: { backgroundColor: '#1c1c24', borderRadius: 12, padding: 16, marginBottom: 20 },
  cardTitle: { color: '#e8e8f0', fontWeight: '600', fontSize: 15, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  rowLabel: { color: '#aaa', fontSize: 14 },
  input: {
    backgroundColor: '#0f0f13', color: '#e8e8f0', borderRadius: 8, padding: 12,
    fontSize: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a38',
  },
  button: { backgroundColor: '#4CAF50', borderRadius: 8, padding: 13, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  signOutBtn: { borderWidth: 1, borderColor: '#f87171', borderRadius: 8, padding: 13, alignItems: 'center' },
  signOutText: { color: '#f87171', fontWeight: '600', fontSize: 15 },
});
