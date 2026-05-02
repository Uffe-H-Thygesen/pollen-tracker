import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';

const SCORE_LABELS = ['None', 'Minimal', 'Mild', 'Moderate', 'Severe', 'Extreme'];
const SCORE_COLORS = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336', '#9C27B0'];

export default function LogScreen() {
  const { session } = useAuth();
  const { coords, error: locError } = useLocation(session?.user.id);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  async function logSymptom() {
    if (!coords) { Alert.alert('Location unavailable', 'Please enable location or set it manually in Settings.'); return; }
    setSaving(true);
    const { error } = await supabase.from('symptom_logs').insert({
      user_id: session!.user.id,
      score,
      latitude: coords.latitude,
      longitude: coords.longitude,
      location_label: coords.label ?? null,
    });
    setSaving(false);
    if (error) Alert.alert('Error', error.message);
    else setLastSaved(new Date());
  }

  const color = SCORE_COLORS[score];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>How are your symptoms?</Text>

      <View style={[styles.scoreCircle, { borderColor: color }]}>
        <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
        <Text style={[styles.scoreLabel, { color }]}>{SCORE_LABELS[score]}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={5}
        step={1}
        value={score}
        onValueChange={setScore}
        minimumTrackTintColor={color}
        maximumTrackTintColor="#2a2a38"
        thumbTintColor={color}
      />

      <View style={styles.sliderLabels}>
        {SCORE_LABELS.map((l, i) => (
          <Text key={i} style={[styles.sliderTick, i === score && { color: '#e8e8f0' }]}>{i}</Text>
        ))}
      </View>

      <View style={styles.locationRow}>
        {locError
          ? <Text style={styles.locError}>{locError}</Text>
          : coords
          ? <Text style={styles.locText}>
              {coords.label ?? `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`}
            </Text>
          : <ActivityIndicator size="small" color="#4CAF50" />
        }
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: color }]}
        onPress={logSymptom}
        disabled={saving || !coords}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Log Symptom</Text>
        }
      </TouchableOpacity>

      {lastSaved && (
        <Text style={styles.savedText}>
          Saved at {lastSaved.toLocaleTimeString()}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 28, alignItems: 'center', paddingTop: 60 },
  heading: { fontSize: 20, color: '#e8e8f0', fontWeight: '600', marginBottom: 36 },
  scoreCircle: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  scoreNumber: { fontSize: 56, fontWeight: '700', lineHeight: 60 },
  scoreLabel: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8, marginTop: -6, marginBottom: 24 },
  sliderTick: { fontSize: 12, color: '#444', width: 20, textAlign: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, minHeight: 24 },
  locText: { color: '#888', fontSize: 13 },
  locError: { color: '#f87171', fontSize: 13 },
  button: { borderRadius: 12, paddingVertical: 15, paddingHorizontal: 40, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  savedText: { color: '#4ade80', marginTop: 16, fontSize: 13 },
});
