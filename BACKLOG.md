# BACKLOG — greg-skylight-dashboard

## P1 — Dashboard Features

- [ ] **Calendar button → full-screen Google Calendar** — Clicking the calendar icon should open Google Calendar full-screen immediately, NOT the small calendar widget. The widget is for ambient screensaver rotation (flash calendar events periodically). If someone taps the widget during screensaver, it ALSO opens full-screen calendar. But the dedicated calendar button must go straight to the full view.

- [x] **Google Calendar integration (READ side)** — Angela's ask. Already wired: dashboard reads from a real Google Family group calendar (`family10884721528653731181@group.calendar.google.com`) via the Google Calendar API key, merged with the Supabase `family_events` table. Verified working 2026-09-07 — API returns 200 for the Family calendar. Events display in the ambient widget rotation and full-screen calendar view.

- [ ] **Google Calendar integration (WRITE side) — BLOCKED on David** — Adding events from the wall to Google Calendar requires OAuth (calendar-auth/calendar-callback edge functions, already coded). Confirmed 2026-09-07: `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET` were never set — the endpoint returns "OAuth not configured". **David must**: create an OAuth 2.0 Web Application client in Google Cloud Console with redirect URI `https://zdmxqzkqutizehynqojk.supabase.co/functions/v1/calendar-callback`, then set the two secrets on the Supabase edge functions. After that, visit `/functions/v1/calendar-auth?action=auth` once to complete the OAuth handshake and store a refresh token.

- [ ] Remove the dead `dwasnwk@gmail.com` calendar ID from `CFG.CALENDAR_IDS` — it 404s on every fetch (private calendar, unreadable via API-key-only auth). Harmless (caught by `.catch`) but pure dead weight.

- [x] **Grocery/shopping list** — Already fully functional on the Skylight touchscreen: add/check/delete/voice-add, two lists ("Angela & David", "Grammy's List"), synced to Supabase `grocery_items`/`grocery_lists`.

- [x] **Grocery list phone access** — SHIPPED 2026-09-07: standalone `grocery.html` deployed as a sibling page on the same Vercel project (https://greg-skylight-dashboard-davids-projects-b0509900.vercel.app/grocery.html). Reuses the same Supabase tables — same data as the wall, mobile-optimized UI, 8s polling so changes show up across devices. Zero new infrastructure.

## P1 — Sensors

- [x] **Arducam as room sensor** — SHIPPED 2026-09-07 (Gregore-private repo, arducam_monitor.py). The Arducam enumerates cleanly as a V4L2 UVC device on the Skylight (`/dev/video9-12`, confirmed "Arducam 1080P Low Light" via `v4l2-ctl --list-devices`). New Sentinel systemd service greg-arducam-monitor captures a still frame every 10s via `v4l2-ctl --stream-count=1` + `adb pull`, feeds it through the existing YuNet face-detect model, and serves `GET /v1/room-presence -> {face_count, faces, checked_at}` (proxied through greg_surface_https.py, same pattern as roku-state). Feeds ring determination + proactive speech decisions.

## P1 — Kiosk Stability

- [x] **Home/back button disappears in launched apps (KTLA+, Maps, etc.) — SHIPPED 2026-09-07** (greg-kiosk repo, commit 389669b). Root cause: launching a heavy app on the 2GB Skylight tablet drives free memory critically low, and Android's low-memory-killer reaps the ENTIRE greg-kiosk process — not just the overlay hiding. Fixed with a watchdog running in a separate process (`android:process=":watchdog"`) registered via a system-owned repeating alarm that survives the main process death and revives the floating home button within ~60s. Verified via raw process kill and full device reboot.

## P2 — Infrastructure

- [x] **Roku ECP integration** — SHIPPED 2026-09-07 (Gregore-private repo, roku_monitor.py). Polls the family room's 43" RCA Roku TV (192.168.2.238). Serves `GET /v1/roku-state -> {tv_on, app, is_playing_content}`. Also identified this session: 192.168.2.171 (Streaming Stick Plus) = living room, 192.168.2.156 (Streaming Stick) = mom's room.

- [x] **Skylight Pixel spoofing persistence** — SHIPPED 2026-09-07 (Gregore-private repo, skylight_spoof_watchdog.sh). Root cause found: `resetprop` needs `adb root` elevation to write properties at all — plain `adb shell` silently fails since property files are root-owned at the DAC level. No Magisk or bootloader flashing needed; the device already supports `adb root` (userdebug/eng build). New Sentinel systemd service greg-skylight-spoof polls `ro.product.model` every 30s and auto re-elevates + re-spoofs if it ever reverts to the real "D156" after a reboot. Verified end-to-end via a real device reboot.
