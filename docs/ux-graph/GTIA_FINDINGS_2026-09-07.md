# Skylight / Wall Greg — GTIA Findings (portfolio-design-system §18)
# 2026-09-07 | Internal pass, run after the external research (EXTERNAL_RESEARCH_2026-09-07.md,
# EXTERNAL_RESEARCH_DEEP_2026-09-07.md). Scripts and matrices in this folder (gtia.py, gtia_fine.py,
# features.tsv, persona_feature.csv, affinity_matrix.csv, gtia_results.json, fine_communities.json).

## 0. Method, honestly stated
- Bipartite graph: 7 personas × 112 features. Persona applicability 0–1 per feature (1 = primary
  user, .6 regular, .3 occasional). Feature importance from the market/HCI evidence (H=1, M=.7, L=.4).
- Persona weights are HOUSEHOLD PRIORS — v0 estimates of each person's share of wall-facing moments,
  NOT measured data: Angela .26 (primary scheduler), David .24 (WFH, cooks, builds), Lilly .16,
  Dwight .12, Grammy .10, Greg-as-curator .08, guest .04. §18.2 forbids builder-supplied weights for a
  market; for a household the family IS the population, so these are priors to be replaced by the
  display log (feature 104 — instrumentation is in the backlog).
- Second graph: 9 arrival contexts × 112 features (morning launch, after-school, dinner prep, dinner,
  wind-down/bedtime, weekend, toddler alone at the wall, guest present, Grammy's day).
- Affinity between two features = persona co-service (weighted, importance-scaled) + context
  co-occurrence, each normalised to its mean so neither dominates (λ = 1). Louvain (python-louvain)
  at resolutions 0.8 / 1.0 / 1.2 / 1.5; six seeds each for stability.

## 1. Results
- Resolution 1.0: **3 communities**, modularity Q ≈ 0.09, seed agreement 0.95.
- Resolution 1.2: **11 communities** (4 singletons), Q ≈ 0.08, agreement 0.93.
- Modularity is LOW. That is a finding, not a failure: unlike PING (where personas partition
  features sharply into Verdict / Investigation / Proof / Cockpit), a family wall's features are
  shared across everyone in the house. The structure that exists is carried by ARRIVAL CONTEXT
  (when) more than by persona (who). The wall should be organised by moment, personalised on approach.

### The three coarse communities (candidate modes)
| # | Name | Reach* | Contexts | Personas | What's in it |
|---|---|---|---|---|---|
| 1 | **HOUSEHOLD OPS** — "the kitchen runs from here" | 16.8 | dinner prep 23, weekend 19, morning 11 | Angela .77, David .69, Greg .54, Grammy .49 | all 15 grocery features, 7 meal features, voice-add + confirm, text/MMS a list to Greg, camera list ingest, staples, dinner's ready, morning briefing, weather advice, color-per-person |
| 2 | **AMBIENT + MEMORY** — "the wall at rest" | 15.5 | evening 30, weekend 21, morning 17, Grammy 13 | Angela .66, David .56, Greg .53, Grammy .47, Dwight .35 | curated slideshow, presence flip, face personalisation, command echo, today's agenda glance, weather glyph, on-this-day (LIFELOG/Throwbak), activity planner, week view, flyer import, TV intercom, kids' artwork |
| 0 | **KIDS + PLAY** — "the kids' wall" | 13.9 | after-school 36, evening 20, toddler alone 20 | Lilly .50, Greg .49, Dwight .47 | all 14 toddler-play features, 9 routine/reward features incl. routine→device unlock, Dwight's 7 curiosity features, content-by-name TV, timers/chalkboard, kid reach-height zone |
*Reach = Σ persona-weight × applicability × importance over the community's features.

### The fine partition (sub-surfaces inside each mode)
- OPS → **Lists + Meals + Adds** (24 features, reach 12.3; dinner prep) and **Morning Brief**
  (7 features; agenda glance, briefing with a face, color per person, weather advice/precip/dress
  hint, per-person filter). Angela's commute to school belongs here and was missing from the inventory.
- AMBIENT → **Photo Frame / Guest / Grammy** (10; slideshow, print cadence, guest mode, captions,
  push-in, grandparent legibility, weather scene), **Plan + Remember** (21; evening/weekend: activity
  planner, LIFELOG on-this-day, Throwbak albums, week view, flyer/school import, Google write-back,
  countdowns, suggestions), and **Alerts** (3; TV intercom, severe weather, brightness matching).
- KIDS → one cluster of 39 (routines + unlock + toddler play + Dwight + content-by-name TV + tools).
- Four features Louvain isolates as singletons — presence/face personalisation (96), every command
  echoed (101), presence-triggered flip (81), on-device face recognition (82) — plus nav minimalism
  (98), undo (93) and instrumentation (104). They connect equally to everything: they are
  INVARIANTS of the whole surface, not features of any one mode.

## 2. What the graph says the wall IS
1. **One resting state** — the frame: curated photos with a glance strip (time, weather glyph,
   next event, tonight's dinner). It is the guest's and Grammy's whole experience and everyone's
   default.
2. **Three summoned modes, not eight icons:**
   - **Household** (lists, tonight, cook mode, adds by voice/text/camera) — the dinner-prep and
     weekend workspace, Angela and David's mode.
   - **Kids** (routines → unlock, Lilly's play, Dwight's curiosity, content-by-name TV) — the
     after-school and bedtime mode; the wall's differentiator.
   - **Plan & Remember** (week, imports, activity planner, on-this-day, albums) — the evening and
     weekend sit-down layer; where memory (LIFELOG/Throwbak) lives.
3. **The morning brief is a scheduled state of the resting layer** (roughly 6–8am on school days),
   not a mode: agenda by person, dress hint, precip, commute, Greg says it once to whoever walks in.
4. **Verbs are everywhere and need no icon** — add, put on, dinner's ready, timer, show me. They
   need ECHO (invariant 101), not navigation.
5. **Invariants** apply in every state: presence zones (far → implicit → personal, Vogel &
   Balakrishnan), face personalisation on approach, every command echoed, undo for anything
   proactive, kid reach-height touch zone, and the display log that replaces these priors.

### Against today's nav (8 icons: calendar, weather, media, music, commute, Greg, list, download)
- Weather and commute are not destinations — they are glance-strip elements and lines in the
  morning brief. Icons → gone (weather scene stays ambient; tap the strip for the hourly view).
- Media and music are verbs (content-by-name, jukebox) — they live in Kids and Household, not as
  icons; the now-playing card appears when something is playing (structured push).
- Calendar splits: the glance (agenda, resting layer), the week/imports (Plan & Remember), the
  adds (a verb). The month grid is one tap inside Plan & Remember.
- List → Household. Greg → the talk affordance stays. Download → drop.
- Proposed chrome: **three mode tiles + talk**, defaults driven by time of day and by who is
  standing there. If a mode is empty for the person present, it does not show.

## 3. Per-persona leads (what the wall should lead with when it knows who you are)
- Angela: agenda glance, weather advice, shared list with bought state and delete, voice add,
  staples, list-from-meal-plan, flyer import, Google write-back.
- David: the same ops set plus text/MMS-to-Greg, content-by-name TV, on-this-day, activity planner.
- Lilly: no-fail play, giant targets, payoff per tap, animal sounds/peekaboo, rotating short
  activities, Greg reacting to her by name, generous listening, never "wrong."
- Dwight: picture-step routine, one-tap complete, confetti, routine → unlock, why-answers, jokes and
  facts, never "I don't know."
- Grammy: weather glyph, her own list by voice, the slideshow, on-this-day, large type, echo.
- Guest: slideshow, guest mode, weather, minimal chrome, agenda glance only.

## 4. What the graph could NOT decide, and what replaces the guess
- Persona weights are priors. The display log (asked / dismissed / tapped / timed out, per view,
  per detected person, per hour) plus grocery/calendar activity and Roku state replace them; re-run
  gtia.py monthly with measured weights.
- Louvain cannot rank features inside a mode for build order — that is reach × steps-removed,
  i.e. the customer-obsessed directive. Section 5 does it.
- The graph says nothing about layout, type, or colour. Those go through the design skill per
  function (§0–§17), one spec each.

## 5. Build order that falls out (mode-by-mode, reach × steps removed)
1. HOUSEHOLD: grocery lifecycle + delete + staples-by-frequency + text/MMS-to-Greg ingest + camera
   ingest; "Tonight" card + ingredients→dishes; dinner's ready broadcast (TVs incl. Grammy's room).
2. RESTING LAYER: glance strip + morning brief with a face; presence flip; face personalisation.
3. KIDS: picture routines with one-tap complete and Greg-enforced unlocks; Lilly's play mode;
   Dwight's curiosity mode with never-dead-end.
4. PLAN & REMEMBER: week view, flyer/school import by voice or camera, activity planner (WG-09),
   LIFELOG/Throwbak on-this-day (existing thread), Google write-back (WG-02, blocked on David).
5. INVARIANTS: display-log instrumentation first (it is what makes the next run real), undo, guest
   mode, grandparent legibility.
