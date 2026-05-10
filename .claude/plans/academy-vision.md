# dronelingo Academy — Next-Generation Pilot School Vision

> Strategic design document. Source-of-truth for the academy redesign that takes
> the current MVP (9 topics × 2 lessons + 45 questions, A1/A3 only) to a
> cinematic, mission-based pilot academy across A1/A3 + A2 + STS.
>
> All claims trace to files in `docs/knowledge/`. No external/training-data
> regulatory wording is used. Compatible with the existing dark/tactical UI
> already shipped (`feat(design-system): dark-first token system` — commit 2026984).

---

## 1. Knowledge analysis

### 1.1 Source reliability tiers

| Tier | Use | Files |
|---|---|---|
| **A — authoritative, primary** | direct citation, sourceRef | `eu-regulations/EU-2019-947-implementing-regulation-EN.pdf`, `eu-regulations/EU-2019-945-delegated-regulation-EN.pdf`, `eu-regulations/EU-2020-639-amending-947-STS.pdf`, `eu-regulations/EU-2020-1058-amending-945-class-C5-C6.pdf`, `easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf`, `easa/EASA-AMC-GM-Reg-2019-947-latest.pdf` |
| **B — authoritative, national** | Latvia-specific facts; only legally binding for Latvia | `latvia-caa/UAS-Atverta_kategorija-Informacijas_kopsavilkums-V3-2025_07_08.pdf`, `latvia-caa/UAS-CBO-LVA-Local_conditions-V1_2-2024_04_30.pdf`, `latvia-caa/2024_11_27-CAA-Par_UAS_geografiskajam_zonam.pdf`, `latvia-caa/STS_eksamena_temas-V1.pdf`, `latvia-caa/web-snapshots/*.md` (19 files, captured 2026-05-08) |
| **C — pedagogical, validated** | learning narrative, never the law | `training-guides/EASA-open-category-rules.pdf`, `training-guides/EASA-QA-UAS-regulations.pdf`, `training-guides/UK-CAA-Drone-Code-2026-03.pdf`, `training-guides/SmartDublin-Drone-User-Handbook.pdf`, `training-guides/Drones4VET-Module1-Drone-Regulation-EN.pdf`, `training-guides/Ireland-IAA-EU-UAS-regulations-outline.pdf`, `training-guides/Montenegro-CAA-A1-A3-theoretical-knowledge-training.pdf` |
| **D — practice/format reference** | exam UX patterns only, not factual source | `test-samples/EasyQuizzz-A1-A3-practice-test.pdf`, `test-samples/A1-A3-question-bank.md`, `test-samples/A2-question-bank.md`, `test-samples/STS-topic-bank.md`, syllabi under `training-guides/syllabus/` |

**Rule:** every Question carries `sourceRef`. If a fact only exists in Tier C/D
and cannot be confirmed in A/B, it is removed or rewritten.

### 1.2 Currency check (2026-05-10)

- **Stale risk → flag for re-review**: `Montenegro-CAA-A1-A3-theoretical-knowledge-training.pdf` (2021 era, predates STS finalisation), `Ireland-IAA-EU-UAS-regulations-outline.pdf` (pre C5/C6 amendments). Use only for *pedagogy*, never as sourceRef.
- **Fresh**: Easy Access Rules 2024-07, Latvia summary 2025-07-08, BGKIS mandate (from 2025-01-01), EVR17 Border East closure (2025).
- **Open question**: 2026 EU amendments — none in knowledge/. Need a quarterly re-fetch protocol (see §15).

### 1.3 Gaps in current content

What the user *will* fail without and what we currently don't teach:

| Gap | Evidence | Pedagogical impact |
|---|---|---|
| No A2 course | `content/topics/*` covers A1/A3 only; `STS_eksamena_temas-V1.pdf` and `A2-detailed-syllabus.md` orphaned | 70 % of paid demand (per CAA Latvia exam stats in `web-snapshots/19-dronueksameni-lv.md`) |
| No STS course | `STS-detailed-syllabus.md` exists but no lessons | Pro market, highest LTV |
| No SORA primer | `Risku_novertejums-SORA_metodologija-VADLINIJAS-V1_2.pdf` ignored | Required even to understand Specific category |
| No operator manual lesson | `UAS_ekspluatacijas_rokasgramata-VADLINIJAS-V1_1.pdf` ignored | Mandatory artefact for any commercial op |
| No airspace/map visual layer | All lessons are text-only MDX | Airspace is *spatial* — text cannot teach it |
| No scenario / decision-tree learning | Q&A only | Real exam errors are situational, not factual |
| No spaced repetition | localStorage attempts are flat list | Retention drops to <20 % at 7 days |
| Question bank too small for adaptive testing | 45 questions vs 600+ needed | Re-use rate breaks the engine |
| 3-option questions | All current Qs have 3 options | Official LV A1/A3 exam is 4-option — wrong format |
| No EVR17/border-zone lesson | Mentioned in syllabus, missing from content | LV-specific gotcha that fails students |
| No drone class comparison artefact | C0–C6 mentioned in text, never visualised | Single highest-frequency exam topic |
| No incident case-studies | Real reports ignored | Best memory anchor in aviation training |

### 1.4 Hard-to-learn topics (where students fail)

Ranked by experience + sample-bank pattern analysis (`test-samples/*`):

1. **Distance / 1:1 rule** — confusion between A1/A2/A3 minima. Needs visual.
2. **Geographic zones** — which zone needs what authorisation. Needs interactive map.
3. **Class C0–C6 vs subcategory A1/A2/A3** — two axes confuse beginners. Needs comparison matrix + scenario quiz.
4. **VLOS vs FPV vs observer rules** — looks simple, fails on observer-comm rules (no radio).
5. **Insurance thresholds** — €50 000 vs 750 000 SDR (MK Nr. 447). Numbers without context don't stick.
6. **Battery Wh calculation** — formula Wh = Ah × V is rarely actually computed by students.
7. **Occurrence reporting deadlines** — 72 h vs voluntary; what *must* be reported.
8. **Latvian-specific acts** (MK Nr. 248/374/436/447/457) — wall of numbers without anchor.
9. **BGKIS workflow** — process knowledge, not facts.
10. **STS-01/STS-02 split** — VLOS-controlled-ground-area vs BVLOS-sparsely-populated.

→ Each of the 10 above gets a dedicated **visual artefact + scenario lesson + minimum 6 questions** in the redesign.

### 1.5 Knowledge graph (dependency tree)

```
Foundations
├── What is a UAS / categories (Open / Specific / Certified)        [prereq for everything]
├── Class system C0–C6                                              [prereq for subcategory]
└── Pilot vs Operator roles                                         [prereq for responsibility lessons]
        │
        ▼
Open category core (A1/A3)
├── Subcategories A1/A2/A3 + distance rules                         [needs: classes]
├── VLOS / FPV / Observer                                           [needs: pilot roles]
├── Max height 120 m                                                [standalone]
├── Geographic zones + BGKIS                                        [needs: subcategories]
├── Pre-flight / in-flight / post-flight                            [needs: VLOS, zones]
├── Emergency procedures                                            [needs: pre-flight]
├── Human factors (IMSAFE, vision)                                  [standalone, light]
├── Insurance minima                                                [needs: subcategories]
├── Privacy / GDPR                                                  [standalone]
├── Security / occurrence reporting                                 [needs: emergency]
└── Batteries / mass-balance / Remote ID                            [needs: classes]
        │
        ▼
A2 add-on
├── A2 distance rules (5 m low-speed / 30 m normal)                 [needs: A1/A3 distance]
├── Risk assessment (operator-level, light)                         [needs: pre-flight]
├── A2 theoretical exam format                                      [needs: A1/A3 exam done]
└── Self-practical declaration                                      [meta]
        │
        ▼
Specific category gateway
├── STS-01 (VLOS, controlled ground area)                           [needs: A2 complete]
├── STS-02 (BVLOS, sparsely populated, airspace observers)          [needs: STS-01]
├── PDRA vs SORA                                                    [needs: STS basics]
├── Operator declaration & operator manual                          [needs: STS topics]
├── SORA methodology overview                                       [terminal]
└── Cross-border ops (Article 13 mutual recognition)                [terminal]
```

The current site implements **only the green core (A1/A3)** plus a few isolated A1/A3 lessons. Everything below the first dotted line is missing.

---

## 2. Course architecture — full roadmap

### 2.1 Tracks

| Track | Audience | Outcome | Length |
|---|---|---|---|
| **0 — Onboarding** | First-time visitor | Knows category, picks track | 10 min |
| **1 — A1/A3 Open** | Hobbyist | Passes LV A1/A3 online exam (40 Q / 40 min / 75 %) | 6–10 h |
| **2 — A2 Open** | Close-to-people flying | Passes A2 theoretical at CAA Latvia + signs practical self-decl | +4–6 h on top of T1 |
| **3 — STS-01** | Commercial VLOS | Passes STS-01 + understands operator declaration | +6–8 h on top of T2 |
| **4 — STS-02** | Commercial BVLOS | Passes STS-02 + understands airspace observer chain | +4 h on top of T3 |
| **5 — SORA primer** | Curious / Specific-bound | Understands risk assessment, knows when to hire | +3 h |
| **6 — Cross-border** | Travels with drone | Article 13 mutual recognition, EVR17 closure | +1 h |

### 2.2 Module map (full target state)

Each track is decomposed into **modules → lessons → micro-lessons**. Target: ~85 lessons total.

#### Track 1 — A1/A3 Open (currently the entire site)
9 modules (= current 9 topics), expanded from 2 → ~5 lessons each:

```
M1 Air Safety            — Pilot vs Operator, VLOS, FPV+Observer, Distance rules, 120 m ceiling
M2 Airspace Limitations  — UGZ types, airspace.lv, BGKIS workflow, EVR17 border closure, Geo-awareness ED-269
M3 Aviation Regulation   — Categories (Open/Spec/Cert), EU acts map, Latvian MK acts decoded, A1/A2/A3 vs C0–C6
M4 Human Performance     — Vision & perception, IMSAFE, FPV tunnel vision, Self-awareness
M5 Operational Proc.     — Pre-flight checklist, In-flight discipline, Post-flight, Emergency, Follow-Me
M6 UAS General Knowledge — Class system, Components, Batteries & Wh, Mass/Balance, Direct Remote ID
M7 Privacy               — GDPR basics, Critical infrastructure, Datu valsts inspekcija
M8 Insurance             — Latvia minima (MK Nr. 447), 750 000 SDR threshold, Optional covers
M9 Security              — Cyber, Physical, Occurrence reporting (72 h)
```

#### Track 2 — A2 Open (new)
```
M10 A2 Distance rules    — 5 m low-speed mode, 30 m normal, 1:1 height rule deep-dive
M11 A2 Operator-level    — Self-risk-assessment, low-speed mode mechanics, why C2 ≠ A2
M12 A2 Exam preparation  — Exam format at CAA Latvia, practical self-declaration
```

#### Track 3 — STS-01 (new)
```
M13 Specific intro       — Declaration vs permit, when STS applies
M14 STS-01 ops           — Controlled ground area, VLOS, airspace observers role, max 120 m
M15 Operator declaration — Filling the LV operator declaration, MK Nr. 437
M16 Operator manual      — Required sections, version control, distribution to crew
```

#### Track 4 — STS-02 (new)
```
M17 STS-02 ops           — BVLOS over sparsely populated, observer chain, airspace observer comms
M18 Airspace coord.      — When ATC contact is required, NOTAM workflow for STS-02
```

#### Track 5 — SORA primer (new)
```
M19 SORA in one diagram  — GRC → ARC → SAIL → OSO mapping
M20 Risk classes         — Lethal area, intrinsic vs residual risk
M21 When to hire         — Decision tree: declaration vs SORA vs hire a DOA
```

#### Track 6 — Cross-border (new)
```
M22 Article 13           — Mutual recognition, where it applies, where it doesn't
M23 EVR17 closure        — Border East status, alternative routes
M24 Travelling with drone — Battery rules in baggage, customs
```

### 2.3 Lesson anatomy (mandatory blocks)

Every lesson is built from the same 9 blocks. Some can be empty for short lessons; **at minimum 5 must be present**.

| # | Block | Purpose |
|---|---|---|
| 1 | **Mission briefing** (90 sec) | Hook + "what you'll be able to do after this" |
| 2 | **Cinematic scene** | One Nano Banana image setting the mood (drone pre-dawn, airspace HUD, etc.) |
| 3 | **Core content** | The actual regulation/concept, ≤400 words |
| 4 | **Visual artefact** | Diagram, map, comparison table, infographic — generated |
| 5 | **Scenario block** | "You are flying X. What happens if Y?" — branching mini decision tree |
| 6 | **Memory anchor** | 1 sentence trick + visual icon (e.g. "1:1 = your height is your minimum distance") |
| 7 | **Common mistakes** | 3 bullet points from real incident reports (`web-snapshots/17-incident-reporting.md`) |
| 8 | **Mini quiz** | 3 questions, instant feedback, distractor rationale |
| 9 | **Debrief** | What you learned + which exam questions this unlocks |

→ Implementation note: extend the MDX renderer with custom components `<MissionBriefing>`, `<CinematicScene>`, `<Artefact>`, `<Scenario>`, `<MemoryAnchor>`, `<CommonMistakes>`, `<MiniQuiz>`, `<Debrief>`. The current MDX setup in `next-mdx-remote/rsc` supports this — add via `components` prop in `src/lib/mdx.ts` (or wherever lesson rendering is centralised).

---

## 3. Pedagogical strategy

### 3.1 Learning psychology principles applied

| Principle | Concrete application here |
|---|---|
| **Cognitive load theory** (Sweller) | ≤400 words per lesson body; visual artefact carries half the load |
| **Active recall** (Bjork) | Every lesson ends with mini quiz; weak questions resurface in /practice |
| **Spaced repetition** | SM-2 algorithm (see §5.4) on per-question intervals |
| **Dual coding** (Paivio) | Every fact has both textual rule and visual icon/scene |
| **Worked examples** | Scenario block always shows reasoning, not just answer |
| **Desirable difficulty** | Distractor options in 4-option questions are *plausible*, not silly |
| **Interleaving** | Practice sessions mix topics; not all questions from one topic in a row |
| **Retrieval-augmented memory** | After 3rd failure on a Q, route user back to the *specific lesson section* |

### 3.2 Voice & tone

Already established in the dark/tactical redesign. Keep:
- Mission-briefing register, never marketing register.
- Short sentences. Active voice. No corporate hedging ("it is generally recommended that…" → "do this").
- LV is primary market, but EN is fallback per CLAUDE.md → write EN cleanly, never as a translation.

### 3.3 Anti-patterns (banned)

- "Click next to learn more" pagination as the entire UX
- Long PDFs presented as scroll
- 30-question quizzes with no feedback between
- Achievements that say "Great job! 🚀"
- Cartoon mascots
- Anything resembling Moodle, including breadcrumbs that look like Moodle's
- Modal popups for hints
- Forced video playback before content access

---

## 4. Exam system

### 4.1 Modes

| Mode | Length | Difficulty | When used |
|---|---|---|---|
| **Drill** | 5–10 Q | mixed | After a lesson, in /practice |
| **Topic mock** | 20 Q | stratified within topic | Per-topic mastery check |
| **Mock exam — A1/A3** | 40 Q / 40 min | stratified, weighted | Final readiness |
| **Mock exam — A2** | 30 Q / 30 min | A2-weighted | A2 readiness |
| **Mock exam — STS-01/02** | per CAA format | from STS bank | STS readiness |
| **Adaptive review** | 15 Q | targets weak areas | Daily warm-up |
| **Boss exam** | 60 Q / 60 min | harder than real | Pre-real-exam stress test |

### 4.2 Question quality rules

Every question must:
1. Have **4 options** (matches CAA Latvia format — fix from current 3).
2. Have an **explanation for the correct answer** (already present).
3. Have **distractor rationales** — *why* each wrong option is wrong (new).
4. Carry a `sourceRef` that points into `docs/knowledge/`.
5. Tag a `difficulty` 1–3 + a `cognitiveLevel` (recall / apply / analyze).
6. Tag a `scenarioType` (factual / map / numeric / decision / regulatory).
7. Link to a lesson section for routing on 3rd failure.

### 4.3 Bank growth plan

Target volumes:

| Track | Current | Target | Strategy |
|---|---|---|---|
| A1/A3 | 45 | 350 | Expand each topic from 5 → 35–40 Q. Add 15 map/scenario Q. |
| A2 | 0 | 120 | From `A2-question-bank.md` + A2 syllabus + Latvia A2 web snapshot |
| STS-01 | 0 | 90 | From `STS-topic-bank.md` + Latvia STS topics |
| STS-02 | 0 | 60 | From STS-02 sections of Easy Access Rules |
| **Total** | **45** | **~620** | |

Question generation pipeline:
1. **Author from authoritative source** (Tier A/B) — never Tier C.
2. **Pin sourceRef** to a chunk in the source PDF or .md file (page + paragraph).
3. **Peer-validate** against a second source (cross-check rule).
4. **Calibrate difficulty** after 30 attempts (item response theory; demote auto-pass items).
5. **Retire stale**: when a regulation amendment lands, all Q with that sourceRef enter re-review queue. (See `i18n-coverage-reviewer.md` / similar pattern, and trigger via `regulation-source-auditor` agent already configured.)

### 4.4 Adaptive scoring & weak-area detection

- Per question: per-user Elo-style rating. User starts at 1500, question difficulty calibrated.
- Per topic: rolling accuracy over last 20 attempts.
- Weak area = accuracy <70 % over ≥10 attempts.
- Daily warm-up: 15 Q where ≥10 from weak areas, ≤5 from due-for-review by SM-2 schedule.

### 4.5 Mock exam composition (40 Q A1/A3, weighted)

Mirror the official LV exam stratification (from `latvia-caa/web-snapshots/02-a1-a3-online-exam.md`):

| Topic | Q count |
|---|---|
| Air safety | 7 |
| Airspace limitations | 5 |
| Aviation regulation | 5 |
| Human performance | 4 |
| Operational procedures | 5 |
| UAS general knowledge | 5 |
| Privacy | 3 |
| Insurance | 3 |
| Security | 3 |
| **Total** | **40** |

(Adjust once we audit the exact real ratio against the official spec; current weighting is pulled from the existing `src/lib/exam-builder.ts` if it exists, otherwise from syllabus.)

---

## 5. Retention & engagement

### 5.1 Pilot progression system

Ranks tied to **demonstrated competence**, not vanity points:

| Rank | Unlocked by |
|---|---|
| Recruit | Sign up |
| Cadet | Complete onboarding + first 3 lessons |
| Pilot — A1/A3 ready | Pass 2 mock exams ≥85 % within 7 days, all topics ≥70 % rolling |
| Certified A1/A3 | Upload official certificate (Specific cat: certificate number `LVA-RP-…`) |
| Pilot — A2 ready | A2 mock ≥85 % |
| Certified A2 | Upload A2 cert |
| STS-01 ready / Certified | same pattern |
| STS-02 ready / Certified | same pattern |
| Instructor | manual grant |

No XP. No leaderboards. No streaks beyond a quiet "7-day study streak" indicator.

### 5.2 Skill map

A radar/HUD chart per user across the 9 A1/A3 topics + A2 + STS, showing current mastery. Visual primary, numbers secondary. Matches tactical HUD aesthetic already shipped.

### 5.3 Re-engagement (without spam)

- Email reminder **only** at exam-readiness thresholds: 7 days inactive after passing first mock; weak topic resurrected after 14 days.
- No daily nag. No streak-loss alarms.
- One push: when LV CAA changes the regulation (we have a watcher already implied by `regulation-source-auditor` agent), users with affected mastery get notified.

### 5.4 Spaced repetition engine

Algorithm: **SM-2** (lightweight, well-trodden). State per `(userId, questionId)`:
- `ef` (ease factor, init 2.5)
- `interval` (days)
- `repetitions`
- `dueAt`

On each answer:
- Wrong → `repetitions = 0`, `interval = 1`, `ef = max(1.3, ef − 0.2)`
- Correct → `repetitions++`, `interval = next per SM-2 table`, `ef` updated by quality 3/4/5
- Stored alongside `Attempt` rows; for anonymous users, stored in localStorage under `dronelingo:srs:v1`.

---

## 6. Visual learning system

### 6.1 Visual asset inventory (target)

Per-lesson assets are budgeted upfront. Generated via Nano Banana, stored under `public/img/lessons/{module}/{lesson}/`. Naming: `{lesson-slug}-{type}-{n}.{webp|svg}` (e.g. `vlos-scene-1.webp`, `distance-rules-diagram-1.svg`).

Each lesson gets minimum:
- 1 cinematic scene (hero, photographic)
- 1 diagram (vector preferred, SVG; raster fallback)
- 1 icon for memory anchor

Module-level shared assets:
- 1 module cover (cinematic)
- 1 module summary infographic (vector)

Total budget: ~85 lessons × 3 + 24 modules × 2 = ~300 visuals. Done in waves, not all at once.

### 6.2 Visual taxonomy

| Type | Format | When |
|---|---|---|
| **Cinematic scene** | Photorealistic, 16:9, dark/moody | Module hero, lesson scene |
| **Tactical map** | Vector with HUD overlay | Airspace, geozones, distance rules |
| **Diagram** | Vector, line-art on dark | Drone anatomy, battery cell, Wh formula |
| **Comparison matrix** | Vector table with icons | Class C0–C6, subcategory rules |
| **Flow / decision tree** | Vector | Pre-flight checklist, occurrence reporting |
| **Scenario illustration** | Photorealistic with HUD callouts | Real-world scene + overlay |
| **Memory anchor icon** | Tiny vector, 64×64 | Single concept per lesson |

### 6.3 Animation strategy

Reserve motion for *teaching moments*, not decoration:
- **Reveal** — diagram lines drawn in sequence (e.g. distance rule chain)
- **Compare** — A1 vs A3 zones cross-fade
- **Trace** — flight path animated over a map
- **State change** — UGZ colour flips when authorisation toggles
- **Parallax** — module covers only, ~10 px on scroll

Implementation: Framer Motion (already lighter than alternatives, fits the dark tactical UI). Reduce-motion respected always.

### 6.4 Interactive blocks

Custom MDX components, all React + Tailwind v4 + Framer Motion:

| Component | Behaviour |
|---|---|
| `<DistanceRuleSimulator />` | Drag drone closer/farther; A1/A2/A3 zones light up |
| `<UGZMap region="latvia" />` | Pannable mock map, click a zone → what's needed |
| `<ClassComparator />` | Slider to compare C0–C6 across MTOM/speed/use |
| `<WhCalculator />` | Inputs V, Ah → Wh; explains air-travel limits |
| `<IMSAFEChecklist />` | Self-assessment, stores result locally |
| `<ScenarioBranch />` | Decision tree, shows path + outcome |
| `<EmergencyDrill />` | Timed "what would you do?" with 10-sec timer |
| `<PreFlightChecklist />` | Persistent local checklist, exports to clipboard |
| `<ZoneClassifier />` | Drag-and-drop: classify info / restricted / prohibited |

---

## 7. Nano Banana visual prompts (concrete library)

> Use `mcp__nanobanana__generate_image`. All scenes share a fixed art direction
> so the academy feels coherent. Save outputs to `public/img/lessons/...`.

### 7.1 Art direction (paste at top of every prompt)

```
Style: cinematic, photoreal, aviation-grade. Cool blue-grey palette,
dark slate background. Subtle volumetric haze. Sharp focus on subject,
shallow depth of field. Inspired by DJI marketing photography crossed
with military aviation training visuals. No text, no logos, no people
unless explicitly requested. 16:9 unless specified.
```

### 7.2 Hero / module covers

| ID | Module | Prompt addition |
|---|---|---|
| `mod-air-safety-cover` | Air Safety | "Drone pilot silhouette at dawn, holding controller. UAS visible 100m away. Wide horizon. Subtle HUD overlay showing VLOS cone." |
| `mod-airspace-cover` | Airspace | "Top-down tactical map of coastal Latvia with overlaid geo-fence zones in cyan, amber, red. Drone icon at centre. Faint compass rose." |
| `mod-regulation-cover` | Regulation | "Architectural shot of EU regulation binders on a tactical metal desk, with a tablet showing UAS class chart. Cold lighting." |
| `mod-human-perf-cover` | Human Performance | "Pilot's POV: controller in hand, slight motion blur. Dashboard reflection in goggles, focus on eye." |
| `mod-ops-proc-cover` | Operational Procedures | "Drone on a launch pad, pre-flight tools laid out around it: anemometer, tablet, fire-safe LiPo bag, radio. Overhead light." |
| `mod-uas-knowledge-cover` | UAS Knowledge | "Exploded-view technical illustration of a quadcopter on dark slate: frame, motors, ESC, battery, GPS. Engineering blueprint feel." |
| `mod-privacy-cover` | Privacy | "Drone hovering over a Latvian residential street at dusk, with privacy-blurred windows. Cold rim light." |
| `mod-insurance-cover` | Insurance | "Damaged drone on rural ground, tablet showing insurance form. Late afternoon overcast." |
| `mod-security-cover` | Security | "Drone with cybersecurity overlay: subtle data-stream graphics, padlock icons. Server-room cool blue tones." |

### 7.3 Lesson scenes — selected high-value examples

```
vlos-scene-1: A pilot stands in a flat field, eyes on a small drone ~150 m
away, dawn light. The drone is rendered at scale (a barely-visible black
dot with motion blur). Foreground sharp, mid-field haze. No FPV goggles.
The frame teaches: "this is what VLOS really looks like at 150 m."

fpv-observer-scene-1: Pilot in FPV goggles, second person standing
immediately to the right holding hand on pilot's shoulder, both facing
the same direction. Drone visible in the sky. Indicates "no radio,
direct contact." Side-on cinematic shot.

distance-150m-scene-1: Aerial-perspective view of A3 distance: drone
floating with a 150 m horizontal radius marked as a faint cyan ring
on the ground, with a residential rooftop just outside the ring.

emergency-rth-scene-1: Drone in mid-air with RTH icon overlaid, low
battery indicator, lost-link halo. Background: dusk industrial zone.
Cinematic, slightly tense.

geo-zone-illustration-1: Top-down stylised map showing three zone types
side-by-side: blue (Information), amber (Restricted), red (Prohibited),
with a single drone icon in the centre and arrows pointing to each.

battery-storage-scene-1: LiPo battery in a fire-safe bag, voltmeter
showing storage voltage, ambient temperature gauge. Workshop light.

remote-id-scene-1: Drone in air, with a small graphic showing a tiny
broadcast wave carrying operator ID + position. Visualises the
"active broadcast" concept.

incident-72h-scene-1: Pilot at a desk filling an e.caa.gov.lv incident
form on a laptop, clock on the wall showing time pressure. Cold light.

night-vision-scene-1: A pilot's POV of a drone at twilight with a
red-tinted overlay indicating compromised night vision. Atmospheric.

evr17-border-scene-1: Stylised map of eastern Latvia with a hard red
hatched border zone running north-south. Title-free.
```

### 7.4 Diagram prompts (vector aesthetic, generated as raster then vectorised by hand if needed)

```
diagram-1-1-rule: Side view of a drone at altitude h, with a horizontal
distance d to a person on the ground. A right-triangle overlay shows
"d ≥ h" with a clean cyan annotation. Dark slate background, line-art.

diagram-class-matrix: A grid 6 rows × 4 cols showing C0/C1/C2/C3/C4
classes with MTOM, max speed, allowed subcategory, key restriction.
Icon per class. Line-art on dark slate, no photorealism.

diagram-airspace-types: Three vertical columns: Information (cyan),
Restricted (amber), Prohibited (red), each with the requirement
underneath ("no action", "auth required", "forbidden"). Single drone
icon at top routing into each. Clean infographic.

diagram-pre-flight-flow: 8-node flowchart of pre-flight steps
(reconnaissance → weather → NOTAM → UGZ → BGKIS → UAS check →
geo-awareness → ready) with branches showing failure paths.

diagram-imsafe: Six panels with icons for Illness, Medication, Stress,
Alcohol, Fatigue, Eating. Single-line description under each.

diagram-incident-decision: Flowchart "Did the event meet criteria X?"
→ mandatory (72 h) / voluntary / no-report. Clean three-branch.

diagram-wh-formula: A LiPo battery illustration with V and Ah values
labelled, equals sign, Wh result. Side annotation: "100 Wh = airline
carry-on threshold."
```

### 7.5 Reproducibility

Save the prompt + seed + model id alongside the image (Nano Banana
returns a metadata block — store it in a sibling `.json` per image).
This lets us regenerate consistently when style drifts.

---

## 8. UX/UI strategy

### 8.1 Foundation already shipped (do not redo)

The dark/tactical token system from commit `2026984` + the cinematic landing,
exam HUD, learn/practice redesign from commits `e59971e` → `3b83d7c` are the
foundation. We **extend** this language, not replace it.

### 8.2 Information architecture

Top-nav: **Learn · Practice · Exam · Guide**. Same as today. Add:
- A **track switcher** in the header for A1/A3 / A2 / STS-01 / STS-02 (the user's current track is the default).
- A **mission HUD** widget in the header on /learn and /practice showing: current rank, next unlock, weak topic.

### 8.3 Lesson page layout

```
┌──────────────────────────────────────────────────────────┐
│ HUD bar: Module | Lesson 3 of 5 | ◀ prev | ▶ next  | ⓘ   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│       [cinematic hero image, 16:9, tactical grid]        │
│                                                          │
│   Mission briefing                                       │
│   "After this lesson you will know …"                    │
├──────────────────────────────────────────────────────────┤
│   Core content (≤400 words)                              │
│                                                          │
│   [visual artefact — diagram/map]                        │
│                                                          │
│   Scenario block (interactive)                           │
│                                                          │
│   Memory anchor (icon + 1 line)                          │
│                                                          │
│   Common mistakes (3 bullets, real incidents)            │
│                                                          │
│   Mini quiz (3 Q, instant feedback)                      │
│                                                          │
│   Debrief — exam Qs unlocked by this lesson              │
├──────────────────────────────────────────────────────────┤
│   ◀ prev lesson                  next lesson ▶           │
│   Practice this topic (CTA)                              │
└──────────────────────────────────────────────────────────┘
```

### 8.4 Practice page

Already aligned. Add:
- "Why this question now" tooltip (because SRS due / because weak topic / because new).
- "Open the lesson section that teaches this" link on third failure.
- Compact distractor rationales after answer reveal.

### 8.5 Exam page

Already good. Improvements:
- Confidence rating per question (toggle, optional) — feeds Brier score on debrief.
- Per-topic readiness gauge before starting — refuse to start a mock if a topic is <50 %.
- Post-exam debrief: a "second pass" mode through only the missed Qs.

### 8.6 Mobile-first

Lessons are read on phones in waiting rooms. Hero image height capped at 40vh on mobile. Mini-quiz UI is one option per row, large hit target.

### 8.7 Accessibility (non-negotiable)

- Reduce-motion → kill parallax + auto-reveal.
- All diagrams have a text equivalent (`<Artefact alt={...} description={...} />`).
- Colour-coded zones also use shape/pattern (red zones get a hatch pattern, not just colour).
- All scenarios are keyboard-navigable.

### 8.8 Performance budget

- Hero images: AVIF + WebP, lazy below the fold. Target: lesson page <150 KB JS, <500 KB image on first paint.
- MDX bundled, no client-side fetch for lesson content.
- Interactive components dynamically imported.

---

## 9. Implementation roadmap

> Multi-quarter, but every step ships independently. No "big bang" releases.

### Wave 0 — Foundation extensions (1–2 weeks)
- [ ] Extend Prisma schema: `Lesson.blocks: Json[]` for the 9-block anatomy, `Question.distractorRationale: Json`, `Question.cognitiveLevel`, `Question.scenarioType`, `Question.lessonSectionRef`.
- [ ] Migrate question YAMLs from 3 → 4 options. New schema validator (`zod`).
- [ ] Build MDX components shell: `<MissionBriefing>`, `<CinematicScene>`, `<Artefact>`, `<Scenario>`, `<MemoryAnchor>`, `<CommonMistakes>`, `<MiniQuiz>`, `<Debrief>`.
- [ ] Author one "gold lesson" end-to-end (M1 / VLOS) to validate the format.

### Wave 1 — Visual + interactive scaffolding (2–3 weeks)
- [ ] Build interactive React components: `<DistanceRuleSimulator>`, `<UGZMap>`, `<ClassComparator>`, `<WhCalculator>`, `<IMSAFEChecklist>`, `<ScenarioBranch>`, `<EmergencyDrill>`, `<PreFlightChecklist>`, `<ZoneClassifier>`.
- [ ] Generate first wave of Nano Banana assets: 9 module covers + 18 lesson scenes (existing lessons get upgraded first).
- [ ] Implement SRS state model (`dronelingo:srs:v1` for anon, table for authed).

### Wave 2 — A1/A3 content expansion (4–6 weeks)
- [ ] Expand 18 → ~45 A1/A3 lessons.
- [ ] Grow A1/A3 bank: 45 → 350 questions (4 options, distractor rationales, sourceRef, difficulty, cognitiveLevel).
- [ ] Build adaptive review engine + mock exam stratification spec.
- [ ] Rank progression UI + skill-map HUD widget.

### Wave 3 — A2 track (3–4 weeks)
- [ ] M10–M12 lessons.
- [ ] 120 A2 questions.
- [ ] A2 mock exam mode.
- [ ] Track switcher in header.

### Wave 4 — STS-01/02 tracks (4–6 weeks)
- [ ] M13–M18 lessons.
- [ ] 150 STS questions (90 STS-01 + 60 STS-02).
- [ ] Operator declaration + operator manual lesson with downloadable LV-localised templates.
- [ ] STS exam modes.

### Wave 5 — SORA primer + Cross-border (2 weeks)
- [ ] M19–M24 lessons.
- [ ] +50 questions (SORA, Article 13).

### Wave 6 — Auth + sync (depends on issue #3)
- [ ] Wire NextAuth (currently blocked on DNS + Resend).
- [ ] One-shot localStorage → server migration on first sign-in.
- [ ] Server-side SRS, ranks, certificates.

### Wave 7 — Polish & moat
- [ ] Quarterly regulation re-fetch protocol (use `regulation-source-auditor` agent).
- [ ] Real Stripe (after ≥10 successful stub-checkouts, per CLAUDE.md).
- [ ] Instructor seat / B2B mode.
- [ ] LV → other EU markets (Tier-1: ru/lv/en already; Tier-2: DeepL fallback per CLAUDE.md i18n).

### Acceptance bar per wave

A wave ships only when:
- `make check` clean.
- `make build` clean.
- All new questions have sourceRef pointing into `docs/knowledge/`.
- All new lessons have ≥5 of the 9 mandatory blocks.
- Lighthouse mobile ≥90 on a sampled lesson.
- Manual UX walkthrough in dev + 1 real user on Latvia exam path.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| Regulation change mid-course | `regulation-source-auditor` agent on quarterly schedule; every Q has sourceRef so re-review is mechanical |
| Visual generation drift | Pin art-direction block + store seed/prompt next to every asset |
| Content authoring becomes the bottleneck | Author one gold lesson per wave first, validate format, then parallelise |
| SRS engine over-engineered | SM-2 only; resist switching to FSRS until ≥10 000 attempts logged |
| 4-option migration breaks existing attempts | Treat as new question version; old attempts retained but flagged "v1 (3-option)" |
| Auth blocked on #3 indefinitely | All Wave 0–5 work runs anonymous-mode-first; auth is a sync layer, not a gate |
| Tier-C/D content leaking into Tier-A sourceRefs | CI lint: question's sourceRef must point to a Tier A/B file in `docs/knowledge/` (regex check) |
| Latvia-specific facts confused with EU facts | Two sourceRef slots: `sourceRefEU` and `sourceRefLV`; LV-only Q must have `sourceRefLV` populated |

---

## 11. Out of scope (explicit YAGNI)

- Live air-traffic data integration.
- Real flight simulator (we are a *theory* academy first).
- Mobile native apps. PWA only.
- Forum / community features. Slack-style chat. Discord.
- Instructor video calls. Calendly. Booking.
- Multi-tenant SaaS for flight schools (revisit after 1 000 paying users).
- DeepL Tier-2 expansion before LV/RU/EN content is mature.

These can come later. None of them affect the core "newbie → confident pilot" path.

---

## 12. Definition of done — Academy v1

We can claim the academy is "real" when:

1. A complete novice (no aviation background) lands on `/`, picks A1/A3, reaches `/exam/result` with ≥85 % on two consecutive mocks, all topics ≥70 %, in **≤8 hours total time-on-platform**.
2. Same novice, when shown a screenshot of an unfamiliar UGZ scenario, can verbally explain what's required without lookup.
3. Question bank ≥350 for A1/A3, ≥120 for A2, ≥150 for STS, every question carries a Tier-A/B sourceRef.
4. Every lesson has cinematic hero + at least one visual artefact + scenario block + mini quiz + debrief.
5. SRS in place, daily warm-up takes ≤5 minutes and surfaces a measurable retention gain vs flat practice (A/B logged).
6. The product *feels* like a pilot academy, not an LMS. The user wants to come back, not because of streaks, but because they want to fly safely.

— *end of vision document* —
