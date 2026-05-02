import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend, VictoryTheme } from 'victory-native';
import { supabase, SymptomLog } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { fetchPollenHistory, POLLEN_COLORS, POLLEN_LABELS, PollenType, DailyPollen } from '@/lib/pollen';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SYMPTOM_COLOR = '#c084fc';
const POLLEN_TYPES: PollenType[] = ['alder', 'birch', 'grass', 'mugwort', 'olive', 'ragweed'];

export default function GraphsScreen() {
  const { session } = useAuth();
  const { coords } = useLocation(session?.user.id);

  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [pollen, setPollen] = useState<DailyPollen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visiblePollen, setVisiblePollen] = useState<Set<PollenType>>(new Set(['grass', 'birch']));
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!session || !coords) return;
    loadData();
  }, [session, coords, days]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const [{ data: logData, error: logErr }, pollenData] = await Promise.all([
        supabase
          .from('symptom_logs')
          .select('*')
          .eq('user_id', session!.user.id)
          .gte('logged_at', since)
          .order('logged_at', { ascending: true }),
        fetchPollenHistory(coords!.latitude, coords!.longitude, days),
      ]);
      if (logErr) throw logErr;
      setLogs(logData ?? []);
      setPollen(pollenData);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  function togglePollen(type: PollenType) {
    setVisiblePollen(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  // Normalize pollen values to 0-5 scale per type (relative to max in window)
  const maxByType: Record<PollenType, number> = {} as any;
  POLLEN_TYPES.forEach(t => {
    maxByType[t] = Math.max(...pollen.map(d => d[t]), 1);
  });

  const symptomData = logs.map(l => ({
    x: l.logged_at.slice(0, 10),
    y: l.score,
  }));

  const pollenData = (type: PollenType) =>
    pollen.map(d => ({ x: d.date, y: (d[type] / maxByType[type]) * 5 }));

  const legendItems = [
    { name: 'Symptoms', symbol: { fill: SYMPTOM_COLOR } },
    ...POLLEN_TYPES
      .filter(t => visiblePollen.has(t))
      .map(t => ({ name: `${POLLEN_LABELS[t]} (rel.)`, symbol: { fill: POLLEN_COLORS[t] } })),
  ];

  const xTicks = pollen
    .filter((_, i) => i % Math.ceil(pollen.length / 6) === 0)
    .map(d => d.date);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Symptoms vs Pollen</Text>

      <View style={styles.rangeRow}>
        {[14, 30, 60, 90].map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.rangeBtn, days === d && styles.rangeBtnActive]}
            onPress={() => setDays(d)}
          >
            <Text style={[styles.rangeBtnText, days === d && styles.rangeBtnTextActive]}>{d}d</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Show pollen:</Text>
      <View style={styles.toggleRow}>
        {POLLEN_TYPES.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.toggleBtn, visiblePollen.has(t) && { backgroundColor: POLLEN_COLORS[t] + '33', borderColor: POLLEN_COLORS[t] }]}
            onPress={() => togglePollen(t)}
          >
            <Text style={[styles.toggleText, visiblePollen.has(t) && { color: POLLEN_COLORS[t] }]}>
              {POLLEN_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && (
        <>
          {logs.length === 0
            ? <Text style={styles.empty}>No symptom logs yet for this period. Start logging on the Log tab!</Text>
            : (
              <View style={styles.chartWrap}>
                <VictoryChart
                  width={SCREEN_WIDTH - 32}
                  height={280}
                  theme={VictoryTheme.grayscale}
                  padding={{ top: 20, bottom: 60, left: 44, right: 20 }}
                  domainPadding={{ y: [0.2, 0.2] }}
                >
                  <VictoryAxis
                    tickValues={xTicks}
                    tickFormat={t => t.slice(5)}
                    style={{
                      axis: { stroke: '#2a2a38' },
                      tickLabels: { fill: '#666', fontSize: 10, angle: -30 },
                      grid: { stroke: 'transparent' },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    domain={[0, 5]}
                    tickValues={[0, 1, 2, 3, 4, 5]}
                    style={{
                      axis: { stroke: '#2a2a38' },
                      tickLabels: { fill: '#666', fontSize: 10 },
                      grid: { stroke: '#1c1c24' },
                    }}
                  />
                  {POLLEN_TYPES.filter(t => visiblePollen.has(t)).map(t => (
                    <VictoryLine
                      key={t}
                      data={pollenData(t)}
                      style={{ data: { stroke: POLLEN_COLORS[t], strokeWidth: 1.5, opacity: 0.7 } }}
                      interpolation="monotoneX"
                    />
                  ))}
                  <VictoryLine
                    data={symptomData}
                    style={{ data: { stroke: SYMPTOM_COLOR, strokeWidth: 2.5 } }}
                    interpolation="monotoneX"
                  />
                </VictoryChart>

                <VictoryLegend
                  x={16}
                  y={0}
                  orientation="horizontal"
                  gutter={16}
                  width={SCREEN_WIDTH - 32}
                  data={legendItems}
                  style={{ labels: { fill: '#aaa', fontSize: 11 } }}
                />
              </View>
            )
          }

          <Text style={styles.note}>
            Pollen values are normalized (0–5 = min–max in this period) for visual comparison. They are{' '}
            <Text style={{ fontStyle: 'italic' }}>not</Text> absolute grain counts.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 16, paddingTop: 56 },
  heading: { fontSize: 20, color: '#e8e8f0', fontWeight: '600', marginBottom: 20 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  rangeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#2a2a38' },
  rangeBtnActive: { backgroundColor: '#4CAF5033', borderColor: '#4CAF50' },
  rangeBtnText: { color: '#666', fontSize: 13 },
  rangeBtnTextActive: { color: '#4CAF50' },
  sectionLabel: { color: '#888', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#2a2a38' },
  toggleText: { color: '#666', fontSize: 12 },
  chartWrap: { backgroundColor: '#1c1c24', borderRadius: 12, padding: 8, marginBottom: 16 },
  error: { color: '#f87171', textAlign: 'center', marginTop: 24 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40, lineHeight: 22 },
  note: { color: '#444', fontSize: 11, lineHeight: 16, marginTop: 8 },
});
