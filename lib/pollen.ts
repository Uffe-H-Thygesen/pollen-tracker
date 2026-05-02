export type PollenType = 'alder' | 'birch' | 'grass' | 'mugwort' | 'olive' | 'ragweed';

export const POLLEN_LABELS: Record<PollenType, string> = {
  alder: 'Alder',
  birch: 'Birch',
  grass: 'Grass',
  mugwort: 'Mugwort',
  olive: 'Olive',
  ragweed: 'Ragweed',
};

export const POLLEN_COLORS: Record<PollenType, string> = {
  alder: '#8B4513',
  birch: '#DAA520',
  grass: '#4CAF50',
  mugwort: '#FF8C00',
  olive: '#6B8E23',
  ragweed: '#20B2AA',
};

export type DailyPollen = {
  date: string; // YYYY-MM-DD
} & Record<PollenType, number>;

export async function fetchPollenHistory(
  lat: number,
  lon: number,
  pastDays: number = 90
): Promise<DailyPollen[]> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    hourly: 'alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
    past_days: String(pastDays),
    forecast_days: '1',
    timezone: 'auto',
  });

  const res = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`
  );
  if (!res.ok) throw new Error(`Pollen API error: ${res.status}`);
  const json = await res.json();

  return aggregateHourlyToDaily(json);
}

function aggregateHourlyToDaily(json: any): DailyPollen[] {
  const times: string[] = json.hourly.time;
  const types: PollenType[] = ['alder', 'birch', 'grass', 'mugwort', 'olive', 'ragweed'];

  const byDay: Record<string, { sums: Record<PollenType, number>; count: number }> = {};

  times.forEach((t, i) => {
    const date = t.slice(0, 10);
    if (!byDay[date]) {
      byDay[date] = { sums: { alder: 0, birch: 0, grass: 0, mugwort: 0, olive: 0, ragweed: 0 }, count: 0 };
    }
    types.forEach((p) => {
      const val = json.hourly[`${p}_pollen`][i];
      if (val != null) byDay[date].sums[p] += val;
    });
    byDay[date].count++;
  });

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sums, count }]) => ({
      date,
      alder: count ? sums.alder / count : 0,
      birch: count ? sums.birch / count : 0,
      grass: count ? sums.grass / count : 0,
      mugwort: count ? sums.mugwort / count : 0,
      olive: count ? sums.olive / count : 0,
      ragweed: count ? sums.ragweed / count : 0,
    }));
}
