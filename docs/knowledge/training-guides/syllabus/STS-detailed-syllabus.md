# STS — Detailed Training Syllabus

Sources:
- `latvia-caa/STS_eksamena_temas-V1.pdf` (official CAA Latvia topic list)
- EASA AMC/GM Reg 2019/947 — Specific category, STS Annex 1 Appendix 1 §A
- Latvia CAA STS exam page (`web-snapshots/05-sts-exam.md`)

STS exam: **40 questions / 40 min / ≥75 %** (or 30 questions if you already hold A2 cert) | **LV only** | **20 EUR (CAA, first try)**.

---

## REGULATORY CONTEXT

- STS-01 — VLOS over controlled ground area in populated environment, requires C5-class UAS.
- STS-02 — BVLOS with airspace observers, sparsely populated, requires C6-class UAS.
- PDRA-S01 / PDRA-S02 — equivalent without C-class marking (transitional / pragmatic version).

UAS operator submits **declaration** for STS (not permit). Pilot qualification = STS theoretical certificate + practical accreditation from a recognized organization.

---

## THEME I — AVIATION REGULATION (Aviācijas regulējums)

### I.1 Specific category framework
- Reg 2019/947: Article 5 (specific category), Article 11 (risk assessment), Article 12 (operating permit), Article 13 (cross-border), Article 16 (model clubs).
- AMC/GM provides PDRA templates and SORA methodology.

### I.2 STS vs PDRA vs SORA
| Path | Submission | Risk method | Use when |
|------|-----------|-------------|----------|
| STS | Declaration | EASA-defined STS scenario | Operation matches STS-01 or STS-02 exactly + you have C5/C6 UAS |
| PDRA | Operating permit | Pre-defined risk assessment | Operation matches PDRA-S/G profile |
| SORA | Operating permit | Full SORA (operator-specific) | Anything outside above |

### I.3 Pilot competence requirements
- Minimum age: 18.
- A1/A3 base + STS theoretical certificate + practical accreditation.

### I.4 LUC (Light UAS Operator Certificate)
- Optional. Allows self-authorization within scope agreed with CAA.

### I.5 Cross-border (Art 13)
- Submit `UAS-Application-Outside_the_state_of_registration` form to host CAA + copy of home permit + LV-CBO local conditions form (if flying into Latvia).

---

## THEME II — HUMAN PERFORMANCE LIMITATIONS

### II.1 Single-pilot CRM
- Workload management with airspace observer.
- Phraseology and standard call-outs (manned-aircraft conflict, lost link, departure from operational volume).

### II.2 Fatigue & stress in long BVLOS missions
- Operator OM must define duty time / rest periods.
- 8+ hour ops require rotation or breaks.

### II.3 Decision-making
- TEM (Threat & Error Management).
- Go / No-Go decision points.

### II.4 Crew resource management
- Roles: Remote pilot, airspace observer (VLOS at observation point), UAS observer (different role), launch crew.

---

## THEME III — OPERATIONAL PROCEDURES

### III.1 Operating Manual (OM)
- Mandatory document (template: `latvia-caa/UAS_ekspluatacijas_rokasgramata-VADLINIJAS-V1_1.pdf`).
- Sections: Operator info, organization, UAS list, ops procedures, training, ERP, maintenance.

### III.2 Pre-flight planning
- Operational volume = Flight Geography (FG) + Contingency Volume (CV).
- Ground Risk Buffer (GRB): outer area where UAS would land in worst-case crash.
- NOTAM check, airspace coordination, ground-risk class (GRC) assessment.

### III.3 In-flight
- Standard call-outs every X minutes (operator-defined).
- Containment: technical means (geofence) + procedural (observer triggers landing if OV breached).

### III.4 Post-flight
- Mass-and-balance log, battery cycle log, occurrence ledger, maintenance entry.

### III.5 Emergency Response Plan (ERP)
- Lost link, fly-away, fire, casualty, third-party damage, regulatory notification.
- Roles, contact list, debrief template.

---

## THEME IV — AIR-RISK MITIGATION (Tehniskie un ekspluatācijas pasākumi gaisa risku mazināšanai)

### IV.1 Detect & Avoid (DAA)
- Visual airspace observers (STS-02).
- ADS-B receivers (additional means).
- Electronic conspicuity transmitters (e.g., FLARM, ADS-B Out).

### IV.2 Air Risk Class (ARC)
- ARC-a: atypical airspace (low-altitude near obstacles, segregated airspace, sparsely-flown manned).
- ARC-b/c/d: increasing manned-aircraft density.
- PDRA-G03 specifically addresses ARC-a operations.

### IV.3 Tactical mitigations
- Land or descend on observer call.
- Maintain a "safe altitude" definition where descent below threshold triggers manned-aircraft yield.

### IV.4 Strategic mitigations
- Time/space segregation (TSA, TRA reservation).
- Notifications via NOTAM.

---

## THEME V — UAS GENERAL KNOWLEDGE (advanced)

### V.1 C5 and C6 classes
- C5: STS-01-aligned. Visible labels on tracker, controlled-cruise speed, terminal velocity capped, conspicuity lights.
- C6: STS-02-aligned. Programmable geo-fence, real-time GPS, lost-link mode (terminate or RTH).

### V.2 Subsystems
- Flight controller redundancy, PixHawk-class autopilots.
- C2 link types (telemetry, command), latency budgets.
- Payload integration (gimbal, multispectral, LIDAR).

### V.3 Conformity assessment & technical declaration
- Manufacturer declares C5/C6 conformity per Reg 2019/945.
- Operator can retrofit with kit (C5 add-on kit) under controlled conditions.

### V.4 Maintenance program
- Defined in OM. Periodic inspections per flight hours, calibration logs.

---

## THEMES VI–VIII (only without A2 certificate)

### VI. Meteorology — extends A2 (microclimates, mountain wave, valley turbulence, BVLOS-specific weather risk planning).
### VII. UAS flight performance — fixed-wing stall vs ground speed, range/endurance trade-offs in different winds.
### VIII. Ground-risk mitigation — GRC table, SORA Step #4, parachute/airbag systems, controlled ground area definition.

---

## STUDY ORDER

1. **Pre-req:** A1/A3 cert; ideally A2 cert too (shorter exam).
2. **Read official Latvia STS topic list:** `latvia-caa/STS_eksamena_temas-V1.pdf`.
3. **Read SORA guidelines (LV):** `latvia-caa/Risku_novertejums-SORA_metodologija-VADLINIJAS-V1_2.pdf`.
4. **Read OM template:** `latvia-caa/UAS_ekspluatacijas_rokasgramata-VADLINIJAS-V1_1.pdf`.
5. **EASA Easy Access Rules** specific category chapters: `easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf`.
6. **Question bank:** `test-samples/STS-topic-bank.md` + ProFlyCenter STS-T mock exam.
7. **Book exam at CAA or recognized org:** see `web-snapshots/06-recognized-organizations.md`.
8. **Practical accreditation:** completed at the recognized organization (PDRA-S01 / S02 / G03 specific).

Realistic prep: **30–60 hours** for theory; practical accreditation typically 1–3 days at provider.

STS theoretical certificate validity: **5 years**.
