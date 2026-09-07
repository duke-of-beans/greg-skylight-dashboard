# CLAUDE_INSTRUCTIONS.md — greg-skylight-dashboard

# Last Updated: 2026-09-07

## Pre-Flight

- **Production URL:** `file:///sdcard/dashboard.html` (loaded locally on Skylight D156)
- **Package manager:** N/A — single self-contained HTML file, no build step
- **Deploy flow:** Edit `index.html` → git push → ADB push to Skylight: `adb -s 192.168.2.219:5555 push index.html /sdcard/dashboard.html` → reload via `am start -a android.intent.action.VIEW -d "file:///sdcard/dashboard.html"`
- **Repo URL:** https://github.com/duke-of-beans/greg-skylight-dashboard (private)
- **Default branch:** main

## Architecture

Single self-contained `index.html` (1242 lines). NO build step, NO npm, NO framework.
This is a locally-served file on an Android tablet (Skylight D156, model 150-CAL).

### External Dependencies (runtime)
- **Google Fonts:** Inter + Newsreader (loaded via `<link>`)
- **Supabase:** `zdmxqzkqutizehynqojk.supabase.co` — family schema for grocery/shopping lists
- **Open-Meteo:** Weather API (free, no key needed)
- **Google Calendar API:** `AIzaSyCL3iB71IqdG4ndiwcbz3toX1HslmyXjgs` (API key, Calendar + Drive enabled)
- **Photos:** Supabase edge function proxy (`/functions/v1/photos-proxy`)

### Design System
- Warm dark palette: `--bg:#1E1A16`, `--tx:#F0EBE4`
- Greg purple: `--greg:#B09AD4`
- Family color coding: David=`#5B8DEF`, Angela=`#D4A84B`, Mom=`#7BC9A0`, Lilly=`#E8A0BF`, Son=`#5BB8C9`
- Fonts: Newsreader (serif, display) + Inter (sans, UI)

### Key Features
- Photo slideshow layer with gradient overlays
- Persistent clock + weather overlay
- Interleave card system: calendar, weather detail, grocery list, media controls, Spotify, commute, Greg suggestions
- Nav bar with icon buttons for each card
- GregBridge JS interface for Android-native calls (`Greg.resetDim()`, `Greg.printHtml()`)
- Print support for grocery lists (GregBridge → Android print framework, fallback iframe window.print)

## Devices

- **Skylight D156:** WiFi ADB `192.168.2.219:5555` (direct from G7, always works)
- **Arducam IMX291:** USB OTG on Skylight, 160° 1080p, 2x mics, UVC enumerated at 4x /dev/video nodes
- **Reload script:** `D:\Tools\greg-kiosk\greg-reload.ps1`

## Rules

1. This file is loaded from `/sdcard/` — it must be fully self-contained. No local imports, no ES modules, no build step.
2. All JS must be ES5-compatible (Android WebView on the Skylight may be old Chromium).
3. Keep the file under 2000 lines. If it grows beyond that, split into CSS/JS files also pushed to /sdcard/.
4. Google API key is baked into the file. Do NOT commit secrets to other locations.
5. GregBridge methods (`Greg.*`) may not exist — always check `typeof Greg !== 'undefined'` before calling.
6. The kiosk APK calls `Greg.resetDim()` every minute during 5:30am–midnight to prevent screen dim.
