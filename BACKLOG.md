# BACKLOG — greg-skylight-dashboard

## P1 — Dashboard Features

- [ ] **Calendar button → full-screen Google Calendar** — Clicking the calendar icon should open Google Calendar full-screen immediately, NOT the small calendar widget. The widget is for ambient screensaver rotation (flash calendar events periodically). If someone taps the widget during screensaver, it ALSO opens full-screen calendar. But the dedicated calendar button must go straight to the full view.

- [x] **Google Calendar integration (READ side)** — Angela's ask. Already wired: dashboard reads from a real Google Family group calendar (`family10884721528653731181@group.calendar.google.com`) via the Google Calendar API key, merged with the Supabase `family_events` table. Verified working 2026-09-07 — API returns 200 for the Family calendar. Events display in the ambient widget rotation and full-screen calendar view.

- [ ] **Google Calendar integration (WRITE side) — BLOCKED on David** — Adding events from the wall to Google Calendar requires OAuth (calendar-auth/calendar-callback edge functions, already coded). Confirmed 2026-09-07: `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET` were never set — the endpoint returns "OAuth not configured". **David must**: create an OAuth 2.0 Web Application client in Google Cloud Console with redirect URI `https://zdmxqzkqutizehynqojk.supabase.co/functions/v1/calendar-callback`, then set the two secrets on the Supabase edge functions. After that, visit `/functions/v1/calendar-auth?action=auth` once to complete the OAuth handshake and store a refresh token.

- [ ] Remove the dead `dwasnwk@gmail.com` calendar ID from `CFG.CALENDAR_IDS` — it 404s on every fetch (private calendar, unreadable via API-key-only auth). Harmless (caught by `.catch`) but pure dead weight.

- [x] **Grocery/shopping list** — Already fully functional on the Skylight touchscreen: add/check/delete/voice-add, two lists ("Angela & David", "Grammy's List"), synced to Supabase `grocery_items`/`grocery_lists`.

- [x] **Grocery list phone access** — SHIPPED 2026-09-07: standalone `grocery.html` deployed as a sibling page on the same Vercel project (https://greg-skylight-dashboard-davids-projects-b0509900.vercel.app/grocery.html). Reuses the same Supabase tables — same data as the wall, mobile-optimized UI, 8s polling so changes show up across devices. Zero new infrastructure.

## P1 — Sensors

- [ ] **Arducam as room sensor** — Wire the 160° Arducam IMX291 (USB OTG on Skylight, confirmed enumerated at 4x /dev/video nodes) for room presence detection. Feed to Sentinel for: who's home, how many people, motion detection. Feeds ring determination + proactive speech decisions.

## P1 — Kiosk Stability

- [x] **Home/back button disappears in launched apps (KTLA+, Maps, etc.) — SHIPPED 2026-09-07** (greg-kiosk repo, commit 389669b). Root cause: launching a heavy app on the 2GB Skylight tablet drives free memory critically low, and Android's low-memory-killer reaps the ENTIRE greg-kiosk process — not just the overlay hiding. Fixed with a watchdog running in a separate process (`android:process=":watchdog"`) registered via a system-owned repeating alarm that survives the main process death and revives the floating home button within ~60s. Verified via raw process kill and full device reboot.

## P2 — Infrastructure

- [ ] **Roku ECP integration** — Playback-state awareness for Greg's context. What's playing, paused, volume level. Roku on the same network.

- [ ] **Skylight Pixel spoofing persistence** — resetprop works but doesn't survive reboot without Magisk. Either install Magisk (bootloader is unlocked) or add a boot script via init.d. Current workaround: re-run `/data/local/tmp/spoof-pixel.sh` after reboot or include in greg-reload.ps1.
