import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { supabase, UserProfile } from '@/lib/supabase';

export type Coords = { latitude: number; longitude: number; label?: string };

export function useLocation(userId: string | undefined) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [userId]);

  useEffect(() => {
    if (profile?.use_manual_location && profile.manual_latitude != null && profile.manual_longitude != null) {
      setCoords({
        latitude: profile.manual_latitude,
        longitude: profile.manual_longitude,
        label: profile.manual_location_label ?? undefined,
      });
      return;
    }

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, [profile]);

  return { coords, profile, setProfile, error };
}
