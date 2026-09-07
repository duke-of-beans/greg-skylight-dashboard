# BACKLOG — greg-skylight-dashboard

## P1 — Dashboard Features

- [x] **Calendar button → full-screen Google Calendar** — SHIPPED 2026-09-07. The dedicated calendar nav icon now launches the real Google Calendar app directly (`Greg.launchApp('com.google.android.calendar')`). The small calendarCard widget is untouched — still auto-shows during ambient screensaver rotation, which was always its purpose. Only the deliberate nav-icon tap behavior changed.

- [x] **Google Calendar integration (READ side)** — Angela's ask. Already wired: dashboard reads from a real Google Family group calendar (`family10884721528653731181@group.calendar.google.com`) via the Google Calendar API key, merged with the Supabase `family_events` table. Verified working 2026-09-07 — API returns 200 for the Family calendar. Events display in the ambient widget rotation and full-screen calendar view.

- [ ] **Google Calendar integration (WRITE side) — BLOCKED on David** — Adding events from the wall to Google Calendar requires OAuth (calendar-auth/calendar-callback edge functions, already coded). Confirmed 2026-09-07: `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET` were never set — the endpoint returns "OAuth not configured". **David must**: create an OAuth 2.0 Web Application client in Google Cloud Console with redirect URI `https://zdmxqzkqutizehynqojk.supabase.co/functions/v1/calendar-callback`, then set the two secrets on the Supabase edge functions. After that, visit `/functions/v1/calendar-auth?action=auth` once to complete the OAuth handshake and store a refresh token.

- [x] **Remove dead calendar ID** — SHIPPED 2026-09-07. Removed `dwasnwk@gmail.com` from `CFG.CALENDAR_IDS` — it 404s on every fetch (private calendar, unreadable via API-key-only auth).

- [x] **Grocery/shopping list** — Already fully functional on the Skylight touchscreen: add/check/delete/voice-add, two lists ("Angela & David", "Grammy's List"), synced to Supabase `grocery_items`/`grocery_lists`.

- [x] **Grocery list phone access** — SHIPPED 2026-09-07: standalone `grocery.html` deployed as a sibling page on the same Vercel project (https://greg-skylight-dashboard-davids-projects-b0509900.vercel.app/grocery.html). Reuses the same Supabase tables — same data as the wall, mobile-optimized UI, 8s polling so changes show up across devices. Zero new infrastructure.

## P1 — Sensors

- [x] **Arducam as room sensor** — SHIPPED 2026-09-07 (Gregore-private repo, arducam_monitor.py). Serves `GET /v1/room-presence -> {face_count, faces, checked_at}` via Sentinel systemd service greg-arducam-monitor.

## P1 — Kiosk Stability

- [x] **Home/back button disappears in launched apps (KTLA+, Maps, etc.)** — SHIPPED 2026-09-07 (greg-kiosk repo). Root cause: launching a heavy app drives the 2GB tablet to critically low memory, and Android's low-memory-killer reaps the entire greg-kiosk process. Fixed with a separate-process watchdog that revives the floating home button within ~60s. Verified via raw process kill and full device reboot.

## P2 — Infrastructure

- [x] **Roku ECP integration** — SHIPPED 2026-09-07 (Gregore-private repo, roku_monitor.py). Polls the family room's 43" RCA Roku TV (192.168.2.238). 192.168.2.171 (living room) and 192.168.2.156 (mom's room) also identified.

- [x] **Skylight Pixel spoofing persistence** — SHIPPED 2026-09-07 (Gregore-private repo, skylight_spoof_watchdog.sh). Root cause: resetprop needs adb root elevation, which resets on every reboot. New Sentinel systemd service auto re-elevates + re-spoofs. Verified end-to-end via a real device reboot.
