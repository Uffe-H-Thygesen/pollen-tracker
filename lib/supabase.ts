import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type SymptomLog = {
  id: string;
  user_id: string;
  logged_at: string;
  score: number;
  latitude: number;
  longitude: number;
  location_label: string | null;
};

export type UserProfile = {
  id: string;
  manual_latitude: number | null;
  manual_longitude: number | null;
  manual_location_label: string | null;
  use_manual_location: boolean;
};
