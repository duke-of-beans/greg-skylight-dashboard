# Skylight / Wall Greg — External Research (GTIA Step 0)
# 2026-09-07 | Pass 1 of the IA/UX research David asked for on 09-05, 09-07, and today
# Method: web recon (RECON BEFORE EXTRACTION), ~9 searches across product pages, hands-on
# reviews, TechCrunch/Forbes coverage, and HCI literature (Neustaedter/Brush/Greenberg TOCHI
# 2009, LINC field trials 2007, arXiv 2607.01618, Frontiers 2021/2025, JCM 2024).
# Confidence: W3-W4 unless marked. Ideas are marked W0 (speculation) and kept separate.
# What this is NOT: the graph. This pass produces the FEATURE SET and the importance PRIORS
# that the internal GTIA pass (persona x feature, Louvain) will weight with household data.

## 0. The one-line finding

The market has converged on a family wall display that answers two kid questions without a
parent — "What are we doing today?" and "What's for dinner?" — and lowers the mental load on
one person (almost always mom) by making the household's coordination VISIBLE and SHARED.
Our wall does the first half of that (calendar, lists, photos) and none of the second half
(meals, routines, chores, rewards). What our wall has that none of them have is Greg: a
presence that talks, notices, acts on devices, and knows the family's history.

## 1. Who we benchmarked

| Product | What families pay for | Price signal |
|---|---|---|
| Skylight Calendar 2 / Max (the device we own, re-purposed) | Calendar mashup of every family calendar incl. kids' sports apps (TeamSnap); color per person; Magic Import (photo a flyer/email → events); chores/routines with pictures so pre-readers check them off; stars & rewards; meal planning with recipe digitisation from photos; grocery list auto-generated from the meal plan; one-tap Instacart; AnyList export; photo screensaver; Disney characters (Plus) | $79/yr Plus |
| Hearth Display | Morning/afternoon/evening ROUTINES with kid icons ("even a 6-year-old can master it"); stars & rewards; confetti on completion; Today's Feelings emoji check-in; Family Rhythm Summary + Hearth Helper (AI); rotating photo wallpaper; profiles with faces | ~$699 + $9/mo |
| Amazon Echo Show (5→21) | Announcements/intercom to every Echo; video calls with auto-framing camera; Amazon Kids+ (curated content, approved contacts, limits); Alexa routines; camera feeds; Zigbee hub | $90–$400 |
| Google Nest Hub (Max) | Best-in-class idle photo frame from Google Photos (auto-curated by person/date/event, ambient EQ brightness that makes it look like a print); "show me today's schedule" with travel time; Family Link | $159–$229, not refreshed since 2019 |
| Aura frames | Private family photo network — relatives push photos TO the frame (drives 50% of Aura's sales); on-frame captions (the story behind the photo); on-device face recognition for curation; kids' artwork gallery; elders' frames managed by the young | $150–$300, no subscription |
| AnyList / Bring! / OurGroceries / Listonic | Real-time shared list (the core, always free); aisle/store-section sorting customisable per store; recurring items suggested first; autocomplete from history; recipe → ingredients in one tap; meal plan → list; visual icons for kids/low-tech (Bring!); quantities, notes, photos; Instacart/Walmart | $0–$15/yr |

## 2. Findings by function

### 2.1 Calendar
- HCI canon (Neustaedter, Brush & Greenberg, TOCHI 2009, 44 families): the family calendar's
  job is COORDINATION and AWARENESS at a glance; families are monocentric / pericentric /
  polycentric by how many people take part in calendaring; calendars are extended with
  annotations and augmentations (notes, stickers, flyers); a digital calendar must fit the
  existing routine or it will not be used (LINC field trials, 2007). Ubiquitous access (phone)
  measurably increased non-primary members' involvement. Placement in the kitchen matters;
  opportunistic glances are the mechanism (arXiv 2607.01618, 2026). [W4]
- Market: color per PERSON (not per event type — ours colors by type); today + week + month
  views; multiple profiles visible together so conflicts show; kids' sports apps synced;
  Magic Import from a photo of paper is the feature that "splits Skylight from the
  competition" (Forbes). [W4]
- Our gap: color-by-type instead of by-person; card shows today only; no week strip; no way
  to add from the wall except a manual form; no import from paper; WRITE to Google still
  blocked (WG-02). The "what are we doing today?" answer exists only as data, not as a voice.

### 2.2 Grocery / lists (David's own read: "neat but not super useful")
- Market baseline: real-time shared sync (we have it via grocery.html); items grouped by
  STORE SECTION and re-orderable per store (Costco ≠ Trader Joe's ≠ Ralphs); check = bought,
  checked items move to a "recently bought" pool and are one tap to re-add; recurring staples
  suggested first; autocomplete from the household's own history; quantities and notes;
  recipe ingredients → list in one tap; voice add; Instacart/Walmart hand-off. [W4]
- Bring!'s lesson for this household: ICONS beat words for pre-readers and low-tech users —
  Lilly and Grammy can recognise a milk carton. [W3]
- Our gap, exactly as David described it: check has no meaning (no "bought" state, no
  archive, no re-add), no delete, no quantities, no staples/history, no store ordering, no
  recipe → list. The list accumulates strike-throughs forever.

### 2.3 Meals — the function we don't have at all
- "What's for dinner?" is the #1 or #2 question every reviewer's kids ask daily (Forbes,
  Cubby, Taste of Home). Skylight and Hearth both ship meal planning as a headline feature:
  weekly plan visible on the wall, recipes digitised from a photo of a cookbook page, list
  generated from the plan, "Sidekick suggests something new." [W4]
- We already have recipe DISPLAY (TheMealDB + LLM fallback) and Greg's "Dinner idea:"
  suggestion line — but no plan, no "tonight" answer, no list generation from a recipe.

### 2.4 Routines, chores, rewards — the other function we don't have
- Hearth's routines (icons, step by step, confetti, stars → custom rewards) are the feature
  reviewers call the game-changer for kids' independence; Skylight's chores let pre-readers
  check off by picture. Hearth's "Today's Feelings" emoji check-in is new and loved. [W4]
- For this household: Dwight (7) is squarely the target; Lilly (2) can follow a 3-icon
  bedtime strip. Nothing in our wall does this.

### 2.5 Photos / ambient
- Nest Hub is the idle-frame benchmark: auto-curation by person/date/event, ambient
  brightness matching so it reads as a print, subtle motion. Aura adds the SOCIAL layer —
  relatives push photos in, captions carry the story — and that layer sells the product. [W4]
- Our state: two shared Google Photos albums via photos-proxy, 15s crossfade, finger-pause,
  NASA APOD interleave. David is still sorting his media (09-05); Throwbak has the face
  clusters; LIFELOG has the life events. "On this day" (WG-14) is the natural next step and
  no competitor has a life-event timeline behind it. [W3 on market, W0 on ours]

### 2.6 Kids — Lilly (2) and Dwight (7)
- Under-3s manage basic taps with moderate skill and prefer big single-tap targets; drag
  and multi-touch fail (Frontiers 2021). [W3]
- Toddlers treat screen play as SOCIAL: they initiate — sharing success, asking for help,
  inviting others in (JCM 2024). Learning happens through joint engagement with a warm
  adult; noisy devices interfere with language development; AAP minimises screen time under
  2 (PMC 2016, ScienceDirect 2021). [W4]
- Implication: the research supports David's 09-05 instinct exactly — Greg as a responsive,
  warm VOICE partner for Lilly (wonder, not instruction) is better grounded than autoplay
  video, and "distract Lilly for a long time" is best served by big-tap cause-and-effect
  that Greg REACTS to (a sound, a name, a colour, "where's the cow?") rather than by content
  she watches. Video on the Roku (WG-03) remains the parent's tool; the wall's tool is play
  with a partner.
- Dwight (7): the market gives him chores/routines/rewards; Echo Show gives curated content
  and approved video calls; nothing gives him a curious adult who remembers what he's into.
  MSM Companion already exists in the portfolio for exactly this child.

### 2.7 Media / devices
- Echo Show's ANNOUNCEMENTS ("dinner's ready" to every Echo) is the market's intercom; ours
  is WG-04. Nothing on the market controls the family's existing Rokus by voice from a wall;
  we already do. [W3]

### 2.8 The AI helper layer
- Skylight "Sidekick" and Hearth "Hearth Helper / Family Rhythm Summary" are the market's
  version of Greg: import events from a photo, suggest meals, summarise the family's week.
  None of them have presence (face, voice, sensors), none act on devices, none know history.
  Greg's wall voice is currently a generic Groq prompt (WG-09) — behind the market on the
  narrow features, ahead on the architecture.

### 2.9 Weather — NOT researched this pass (gap for the deep pass)
- Prior (unsourced, W1): glanceable = now + next-hour precipitation + today's high/low +
  "what to wear / take an umbrella" line; the kids' version is a picture.

## 3. Cross-cutting patterns (what the market agrees on)
1. The wall serves the PRIMARY SCHEDULER first — reduce her mental load, and everyone else's
   awareness follows. (Angela asked for the calendar. That is the market's exact story.)
2. Pre-readers must be first-class: pictures for chores, icons for groceries, faces for profiles.
3. Paper → wall via camera is the delighter (Magic Import). We have two cameras.
4. Meals are a wall function, not a phone function.
5. Photo mode is the resting state and the emotional hook; social photo ingest sells frames.
6. Phone companion access is what turns a wall into a shared system (LINC 2007 + every review).
7. Reward mechanics (stars, confetti) are how kids adopt it.

## 4. Gaps in our wall vs the market, ranked by steps removed for THIS family
1. Grocery list has no lifecycle (bought → recently bought → re-add), no delete, no staples,
   no store order, no recipe → list. (Angela, David, Grammy — every shop.)
2. No "what's for dinner" / meal plan on the wall. (Kids ask daily; Angela decides daily.)
3. No routines / chores / rewards. (Dwight's independence; Lilly's bedtime strip.)
4. Calendar: by-person colour, week view, add-from-wall and paper import; Google WRITE.
5. Lilly has nothing that reacts to her; Dwight has nothing built for him.
6. Photos: no story layer (captions, on-this-day), no family push-in.
7. Intercom / announcements.

## 5. What we have that the market cannot copy (the "wow" is here, W0 — ideas)
- Greg answers "what are we doing today?" OUT LOUD, by name, to whoever walked in (WG-08).
- "Hold up the flyer" — Magic Import through the Arducam, no phone needed.
- "On this day" from LIFELOG with the story, not just the photo (WG-14).
- Greg plays with Lilly: her name, her animals, her colours — and remembers what made her laugh.
- Dinner's ready reaches every TV, and Greg says it.
- The wall knows who is in the room and shows THEIR day.
- $0/yr versus $79–$108/yr, and it gets smarter because it's ours.

## 6. What this pass hands to the internal GTIA pass
- Feature set (Step 2): the union of our ~25 nodes and the market's — target 45–60 features.
- Importance priors (Step 3): market evidence per persona class (primary scheduler, partner,
  pre-reader, early reader, grandparent, guest, curator) — to be weighted against household
  data (display log, grocery/calendar activity, Roku state, presence).
- Context graph (§18.4): arrival contexts for a kitchen wall — morning launch, after-school,
  dinner prep, wind-down, weekend, Grammy's day, guest present, Lilly alone at the wall.
