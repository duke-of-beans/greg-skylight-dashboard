# BACKLOG — greg-skylight-dashboard

## P1 — Dashboard Features

- [ ] **Calendar button → full-screen Google Calendar** — Clicking the calendar icon should open Google Calendar full-screen immediately, NOT the small calendar widget. The widget is for ambient screensaver rotation (flash calendar events periodically). If someone taps the widget during screensaver, it ALSO opens full-screen calendar. But the dedicated calendar button must go straight to the full view — adding a click to see a cramped widget that doesn't show event details is worse than no shortcut. Backend decision: shared family Google Calendar.

- [ ] **Google Calendar integration** — Angela asked for this. Wire up a shared family Google Calendar as the data source. Events display in the ambient widget rotation AND the full-screen calendar view.

- [ ] **Grocery/shopping list** — Supabase `family` schema. Editable from the Skylight touch screen and from phones. TBD: phone access mechanism (PWA, native app, or shared URL).

## P1 — Sensors

- [ ] **Arducam as room sensor** — Wire the 160° Arducam IMX291 (USB OTG on Skylight, confirmed enumerated at 4x /dev/video nodes) for room presence detection. Feed to Sentinel for: who's home, how many people, motion detection. Feeds ring determination + proactive speech decisions.

## P2 — Infrastructure

- [ ] **Roku ECP integration** — Playback-state awareness for Greg's context. What's playing, paused, volume level. Roku on the same network.

- [ ] **Skylight Pixel spoofing persistence** — resetprop works but doesn't survive reboot without Magisk. Either install Magisk (bootloader is unlocked) or add a boot script via init.d. Current workaround: re-run `/data/local/tmp/spoof-pixel.sh` after reboot or include in greg-reload.ps1.
