# A1/A3 — Detailed Training Syllabus

Source: EASA AMC1 to UAS.OPEN.020/030/040 (Reg 2019/947) + EU Drone Port course + CAA Latvia online course outline.

40-question / 40-min / ≥75 % exam covers the 9 topics below.

---

## TOPIC 1 — Air Safety (Aviācijas drošums)

### 1.1 Pilot and operator responsibility
- Distinction: UAS operator vs. remote pilot (Reg 2019/947 Art 3 §1, §10).
- Operator responsibilities: registration, marking, insurance, ensuring pilot competence.
- Pilot responsibilities: pre-flight, in-flight, post-flight, occurrence reporting.

### 1.2 Visual Line of Sight (VLOS)
- Definition: pilot can see UAS unaided (corrective glasses allowed).
- Maximum visual range depends on UAS size; pilot must be able to detect attitude and direction.

### 1.3 First-Person View (FPV)
- Allowed only if a UAS observer is next to the pilot (no radio, no phone — direct voice).
- Observer's job: maintain situational awareness of surrounding airspace.

### 1.4 Distance to uninvolved persons
| Sub-cat | Marking | Min horizontal |
|---------|---------|-----------------|
| A1 | <250 g / C0 | over individuals OK, never over assemblies |
| A1 | C1 | reasonably expected no overflight of uninvolved persons |
| A2 | C2 (low-speed) | 5 m (1:1 rule, ≥ flight altitude) |
| A2 | C2 (normal) | 30 m horizontal |
| A3 | <25 kg / C2/C3/C4 | 150 m from residential/commercial/industrial/recreational areas; 1:1 rule, ≥ 30 m from uninvolved persons; ≥ 2-second flight distance at max speed |

### 1.5 Maximum height
- 120 m above ground or water (lower if zone restricts).

### 1.6 Recreational vs. commercial — same rules apply

---

## TOPIC 2 — Airspace Limitations (Gaisa telpas ierobežojumi)

### 2.1 UAS Geographical Zones (UGZ) types
- **Information** — no restriction, just info.
- **Restricted** — req auth / req notification / req conditions.
- **Prohibited** — flights forbidden.

### 2.2 Latvia source of truth
- `airspace.lv/drones` — only legally binding source.
- `ais.lgs.lv/page/UAS_geozones` — JSON/ED-269 for geo-awareness upload.
- BGKIS — submit flight applications (mandatory since 2025-01-01).

### 2.3 Airport vicinity & restricted areas
- Riga airspace assessment by EUROCONTROL — first in EU.
- Border zones (EVR17 Border East) — closed from 2025 along Russia/Belarus border.

### 2.4 What a zone authorisation does NOT allow
- Cannot exceed 120 m, lose VLOS, fly over crowds — those are intrinsic Open category limits.

---

## TOPIC 3 — Aviation Regulation (Aviācijas regulējums)

### 3.1 EU acts
- Reg (EU) 2018/1139 — basic regulation.
- Reg (EU) 2019/947 — operations.
- Reg (EU) 2019/945 — technical / C-classes.
- AMC & GM (EASA) — implementation guidance.

### 3.2 Categories
- **Open** — A1, A2, A3 (low risk, no permit).
- **Specific** — declaration (STS) or operating permit (PDRA / SORA).
- **Certified** — high risk (large delivery, urban transport).

### 3.3 Latvian national acts
- Likums "Par aviāciju" — XI¹, XII chapter.
- MK Nr. 248 — flight rules.
- MK Nr. 374 — recognized organizations.
- MK Nr. 436 — pilot qualification.
- MK Nr. 437 — Specific category operator certification.
- MK Nr. 447 — civil-liability insurance.
- MK Nr. 457 — registry.
- MK Nr. 627 — model-aircraft clubs.

---

## TOPIC 4 — Human Performance Limitations (Cilvēka veiktspēja)

### 4.1 Vision and perception
- Empty-field myopia, night vision degradation, scan technique.

### 4.2 Fatigue and stress
- IMSAFE checklist: Illness, Medication, Stress, Alcohol, Fatigue, Eating.

### 4.3 Cognitive load and attention
- Single-task fixation; FPV tunnel vision; importance of observer.

### 4.4 Self-awareness as the #1 stress source

---

## TOPIC 5 — Operational Procedures (Ekspluatācijas procedūras)

### 5.1 Pre-flight
- Site reconnaissance, weather, NOTAMs, UGZ check, BGKIS application if zone requires.
- UAS check: firmware, battery state, motors, propellers, GPS, RTH point, RTH altitude, geofencing.
- Geo-awareness: upload current ED-269 JSON.

### 5.2 In-flight
- Maintain VLOS, separation from other airspace users, weather monitoring, battery management, manage transitions to/from automatic flight modes.

### 5.3 Post-flight
- Battery cooling and storage, log entry, occurrence reporting if needed.

### 5.4 Emergency procedures
- Lost link → fail-safe (RTH or controlled descent).
- Lost GPS → manual control & land.
- Battery low → return / land at safe spot.
- Fly-away → notify ATC if in controlled area; report incident.

### 5.5 Follow-Me mode
- Max 50 m from pilot in A1.

---

## TOPIC 6 — UAS General Knowledge (Vispārīgas zināšanas par UAS)

### 6.1 UAS classes (Reg 2019/945)
| Class | MTOM | Use |
|-------|------|-----|
| C0 | <250 g, max 19 m/s | A1 — over people |
| C1 | <900 g | A1 — close to people |
| C2 | <4 kg | A2 — close to people, with low-speed mode |
| C3 | <25 kg | A3 — far from people |
| C4 | <25 kg, manual only | A3 — model aircraft style |
| C5 | retrofit kit | STS-01 |
| C6 | BVLOS-capable | STS-02 |

### 6.2 Common UAS components
- Multirotor (helicopter type), fixed-wing, hybrid.
- Frame, motors, ESC, flight controller, GPS, IMU, barometer, compass, downlink/uplink, payload.

### 6.3 Batteries (Li-Po, Li-Ion)
- C-rating, energy (Wh = Ah × V), storage at 50–60 %, no charging if too cold/hot, fire-safe transport in lipo bag.

### 6.4 Mass & balance, CG location
- Different UAS types (rotorcraft vs fixed-wing) have different CG requirements.
- Payload changes affect stability and flight time.

### 6.5 Direct Remote ID & geo-awareness (mandatory for C1, C2, C3)
- Active transmission of operator ID, position, altitude, speed.

---

## TOPIC 7 — Privacy and Data Protection (Privātums)

- GDPR applies to any personal-data collection (faces, license plates, voice).
- Avoid recording identifiable individuals without consent.
- Datu valsts inspekcija (Latvian DPA) is the supervisory authority.
- Specific rules for **critical infrastructure** photography (sign "BEZ SASKAŅOŠANAS FOTOGRAFĒT, FILMĒT AIZLIEGTS").

---

## TOPIC 8 — Insurance (Apdrošināšana)

### 8.1 Latvia minima (MK Nr. 447)
- A1 (C0 / <250 g): not required.
- A1 (C1), A2, A3 (<20 kg): **50 000 EUR**.
- A3 (20–25 kg, C3/C4): **750 000 SDR** (Reg 785/2004).
- Specific cat <500 kg: 750 000 SDR.

### 8.2 Optional covers
- Hull (drone itself), professional liability, payload, export.

---

## TOPIC 9 — Security (Drošība)

### 9.1 Cyber security
- Default passwords, firmware integrity, GPS spoofing & jamming awareness.
- Don't connect drone to untrusted Wi-Fi.

### 9.2 Physical security
- Storage, transportation, theft prevention.

### 9.3 Occurrence reporting (`atgadījumu ziņošana`)
- Mandatory within 72 h: serious injury, near-miss / collision with manned aircraft.
- Voluntary: any safety-related event (lost link, fly-away, near-miss with another UAS, fail-safe failures).
- Submit at `e.caa.gov.lv/incidents` or `aviationreporting.eu`.

---

## RECOMMENDED STUDY ORDER (for self-learners)

1. **Day 1** — Read EASA Open Category rules (`training-guides/EASA-open-category-rules.pdf`).
2. **Day 2** — Latvia summary (`latvia-caa/UAS-Atverta_kategorija-Informacijas_kopsavilkums-V3-2025_07_08.pdf`).
3. **Day 3** — Easy Access Rules — chapters Open category + AMC/GM (`easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf`).
4. **Day 4** — Drones4VET Module 1 (`training-guides/Drones4VET-Module1-Drone-Regulation-EN.pdf`).
5. **Day 5** — Question bank: `test-samples/A1-A3-question-bank.md` + 120mAGL free quizzes.
6. **Exam day** — Take the official exam at `e.caa.gov.lv` after registering for `LVA-RP-############`.

Total realistic prep time: **6–10 hours** for someone new to aviation; ~3 hours for experienced UAV users.
