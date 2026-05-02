# Pollen Tracker

Cross-platform app (iOS, Android, Web) for tracking allergy symptoms against local pollen levels.

## Features

- Register / sign in with email
- Log symptom score 0–5 at any time
- GPS location auto-detected, manual override available
- Pollen data from Open-Meteo (Alder, Birch, Grass, Mugwort, Olive, Ragweed)
- Graph of symptoms vs. pollen over 14/30/60/90 days

## Stack

- [Expo](https://expo.dev) (React Native) — iOS, Android, Web
- [Supabase](https://supabase.com) — auth + PostgreSQL
- [Open-Meteo](https://open-meteo.com) — free pollen API
- [Victory Native](https://formidable.com/open-source/victory/docs/native/) — charts

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_init.sql`
3. Copy your **Project URL** and **anon key** from Project Settings → API

### 2. Environment

```bash
cp .env.example .env
# Fill in your Supabase URL and anon key
```

### 3. Install & run

```bash
npm install
npm start        # opens Expo dev server
npm run web      # web only
npm run ios      # requires macOS + Xcode
npm run android  # requires Android Studio
```

## Deploy web version

```bash
npx expo export --platform web
# Upload the dist/ folder to Vercel, Netlify, or any static host
```

## Deploy to App Store / Play Store

Use [Expo EAS Build](https://docs.expo.dev/build/introduction/):
```bash
npm install -g eas-cli
eas build --platform all
```
