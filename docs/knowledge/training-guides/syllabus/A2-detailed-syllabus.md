# A2 — Detailed Training Syllabus

Source: EASA AMC1 to UAS.OPEN.030 (Reg 2019/947) + Latvia CAA exam-topic page (web-snapshots/03-a2-theoretical-exam.md).

A2 exam: **30 questions / 30 min / ≥75 % | LV/EN | 15 EUR (CAA) or варьирует в признанных центрах**.

A2 covers ONLY 3 themes (assumes A1/A3 already passed):

---

## THEME 1 — METEOROLOGY (Meteoroloģija)

### 1.1 Wind effects on UAS
- **Mean wind**: drift, ground speed vs. air speed, fuel/power use.
- **Gusts**: variability, threshold for safe flight (typically max 10–12 m/s for small multirotors; check OEM).
- **Turbulence types**: thermal, mechanical (terrain/buildings), shear (wind gradient near surface).
- **Urban canyon effect**: street venturi, rooftop vortices, leeward-side rotors near tall buildings.

### 1.2 Temperature
- Air density ↓ as temperature ↑ → less lift, more current, lower flight time.
- Battery capacity ↓ as temperature ↓ (≈30–50 % loss at -10 °C).
- Density altitude effects.

### 1.3 Visibility
- Rain, fog, dust → reduced VLOS range; check pilot's ability to see UAS attitude.
- Sun in eyes — practical issue for orientation.

### 1.4 Air density
- Affects motor performance and stall speed (fixed-wing).

### 1.5 Weather forecast sources
- METAR / TAF (aviation), commercial apps (UAV Forecast, Windy), local observation.
- Pre-flight check: wind, gusts, precipitation, visibility, temperature, cloud base, NOTAMs.

---

## THEME 2 — UAS FLIGHT PERFORMANCE (UAS lidojuma veiktspēja)

### 2.1 Operational ranges
- **Rotorcraft (multirotor)**: high manoeuvrability, can hover; typical max wind 10 m/s, max altitude 5000 m DA.
- **Fixed-wing (lidmašīnas tipa)**: long endurance, fast cruise; stall speed → never below it; needs runway/launch.
- **Hybrid** (VTOL fixed-wing): vertical take-off + cruise efficiency.

### 2.2 Mass and balance
- **Centre of Gravity (CG)** position differs by UAS type:
  - Rotorcraft: CG ideally at vertical axis of rotors.
  - Fixed-wing: typically 25–33 % MAC (mean aerodynamic chord).
- Adding payload shifts CG → affects stability, control authority.

### 2.3 Payload
- **Compatibility**: weight, attachment, aerodynamic effect.
- **Securing**: must be firmly fixed; release in flight is forbidden (in open category).
- **Effect on stability** and flight time.

### 2.4 Batteries (Li-Po focus)
- **Energy source**: chemical → electrical via redox reactions.
- **Types**: Li-Po, Li-Ion, LiFePO4, NiMH (legacy).
- **Terminology**:
  - Capacity (mAh / Ah);
  - C-rating (max discharge: 25 C × 5 Ah = 125 A);
  - Cell voltage (3.7 V nominal Li-Po, 4.2 V max, 3.0 V min);
  - Memory effect (NiCd/NiMH only).
- **Operation**:
  - Charge: only with proper charger, balance charging mandatory for multi-cell.
  - Use: don't discharge below 3.0 V/cell (can damage / fire).
  - Storage: 50–60 % charge, cool dry place.
  - Hazards: thermal runaway, puffing, swollen cells = retire.
  - Disposal: special collection points.

---

## THEME 3 — TECHNICAL & OPERATIONAL GROUND-RISK MITIGATION

### 3.1 Low-speed mode functions
- C2 UAS in A2 must have a low-speed mode capping max speed at **3 m/s**.
- When activated → minimum horizontal distance from uninvolved persons can be reduced as low as **5 m** (under 1:1 rule).

### 3.2 Distance-to-people assessment
- Visual estimation skills.
- Use of measuring features (laser, GPS distance markers).
- Practical exercises in self-study.

### 3.3 The 1:1 principle
- Horizontal distance to uninvolved person ≥ flight altitude.
- Example: at 30 m altitude, min 30 m horizontal; at 5 m altitude, min 5 m horizontal.
- Cap: ≥ 5 m absolute floor in low-speed; ≥ 30 m absolute floor without low-speed.
- And: ≥ 2-second flight distance at max speed (e.g., 14 m/s × 2 s = 28 m extra buffer).

---

## A2 PRACTICAL SELF-STUDY (DECLARED, NOT DEMONSTRATED IN CAA)

Detailed list — see `latvia-caa/web-snapshots/04-a2-practical-self-study.md`. Highlights:

1. **Plan flight**: payload compatibility, site, UGZ, obstacles, met.
2. **Prepare flight**: UAS state, firmware, sensors calibrated, battery checked, geo-awareness updated, altitude limit set.
3. **Normal operations**: take-off, hover/circuit, coordinated turns, straight & level, change direction/altitude/speed, RTH, landing, obstacle clearance.
4. **Emergency**: lost GPS, uninvolved person enters area, departure from operational volume, manned aircraft approach, other UAS, decision-making, manual recovery, C2-link loss.
5. **Pre-/post-flight**: brief, debrief, occurrence reporting situations.

Self-study must be done **in A3-conditions**: ≥150 m from residential / commercial / industrial / recreational areas, with similar UAS to the one used in A2 ops, both manual and stabilized modes.

---

## RECOMMENDED STUDY ORDER

1. **Pre-req:** A1/A3 certificate already valid.
2. **Day 1:** EASA AMC1 to UAS.OPEN.030 — read in `easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf`.
3. **Day 2:** Latvia A2 page (`web-snapshots/03-a2-theoretical-exam.md`) + practical self-study list.
4. **Day 3:** Practical self-study flying (in A3-grade safe area).
5. **Day 4:** Question bank `test-samples/A2-question-bank.md` + 120mAGL A2 quizzes.
6. **Sign self-declaration:** of practical skills completion in e-services portal.
7. **Book A2 exam:** at CAA or recognized organization (`web-snapshots/06-recognized-organizations.md`).

Realistic prep: **8–15 hours** including practical self-study.

A2 cert validity: **5 years**, renewable via online refresher (5 EUR) within 90–5 days before expiry.
