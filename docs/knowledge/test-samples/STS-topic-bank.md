# STS — Topic & Practice Bank

> **Official source:** `latvia-caa/STS_eksamena_temas-V1.pdf` (Latvia CAA full topic list).
> Format: 40 questions / 40 min / ≥75 % | LV only | 20/15 EUR (CAA).
> If you already hold A2 cert, exam shrinks to 30 questions (i–v only).

## ОФИЦИАЛЬНАЯ СТРУКТУРА ЭКЗАМЕНА (Latvia CAA)

| № | Тема | Доля экзамена |
|---|------|--------------|
| i | Aviācijas regulējums | core |
| ii | Cilvēka veiktspējas ierobežojumi | core |
| iii | Ekspluatācijas procedūras | core |
| iv | Tehniskie un ekspluatācijas pasākumi gaisa risku mazināšanai | core |
| v | Vispārīgas zināšanas par UAS | core |
| vi | Meteoroloģija | only without A2 cert |
| vii | UAS lidojuma veiktspēja | only without A2 cert |
| viii | Tehniskie un ekspluatācijas pasākumi zemes risku mazināšanai | only without A2 cert |

## STS-01 / STS-02 — где применяется

| Standard Scenario | Описание | Pilot training |
|---|---|---|
| **STS-01** | VLOS over controlled ground area in populated environment | STS theory + STS-01 practical accreditation |
| **STS-02** | BVLOS with airspace observers, sparsely populated area | STS theory + STS-02 practical accreditation |

PDRA versions of STS use the same theory but C-class marking is not required. См. `latvia-caa/web-snapshots/10-operating-permits.md`.

## ПРИМЕР ВОПРОСОВ (по темам)

### i. Aviācijas regulējums

**Q1.** A UAS operator wants to fly STS-01 in Latvia. What document must be submitted to CAA before flight?
- A. Risk assessment + Operating Permit
- B. ✅ **Operations declaration ("ekspluatācijas deklarācija") via e.caa.gov.lv**
- C. Nothing — STS is automatic
- D. Insurance certificate only

> STS uses *declaration*, not permit. PDRA uses permit. SORA-based ops use full permit.

**Q2.** What is the minimum age for an STS remote pilot?
- A. 14 — B. 16 — C. ✅ **18** — D. 21

**Q3.** A specific-category cross-border flight from Germany to Latvia requires…
- A. New full permit issued by Latvia CAA
- B. ✅ **Application under Reg (EU) 2019/947 Art. 13: copy of original permit + local conditions form (LV-CBO)**
- C. Nothing extra
- D. Latvia operator number

> Forms: `UAS-Application-Outside_the_state_of_registration-V20240409.docx` + `UAS-CBO-LVA-Local_conditions-V1_2-2024_04_30.pdf` (the latter saved in `latvia-caa/`).

### ii. Cilvēka veiktspējas ierobežojumi

**Q4.** During an 8-hour BVLOS shift, what is the recommended max continuous flight task duration before mandatory break?
- A. 2 hours — B. ✅ **No fixed regulatory limit, but operator OM must define limits per fatigue management plan** — C. 8 hours — D. 12 hours

**Q5.** What does CRM stand for in UAS operations?
- A. Crew Resource Management — note: in single-pilot UAS often called "single-pilot CRM" or TEM
- ✅ **Crew Resource Management** (covers crew-of-one + airspace observer interaction)

### iii. Ekspluatācijas procedūras

**Q6.** Under STS-01, you must keep the UAS within VLOS at all times. What is the VLOS distance limit (single pilot, no aided vision)?
- A. ≤ 50 m
- ✅ **B. The maximum distance at which the pilot can maintain unaided VLOS — typically 500 m horizontally for medium-size UAS, but case-specific**
- C. Always 1 km
- D. Unlimited

**Q7.** When must the Emergency Response Plan (ERP) of the OM be activated?
- A. Always after every flight
- ✅ **B. When an off-nominal event occurs (lost link, fly-away, injury, controlled ground area breach)**
- C. Once a year for testing only

### iv. Gaisa risku mazināšana (Air-risk mitigation)

**Q8.** Under STS-02, the airspace observer's role is…
- ✅ **A. To detect manned aircraft entering the operations area and warn the pilot to descend / land / adjust**
- B. To control the UAS in case the pilot is unable
- C. Just for emergency video recording

**Q9.** ARC-a (Atypical airspace) under PDRA-G03 includes flights at ≤30 m AGL because…
- ✅ **A. Manned aircraft very rarely operate that low away from aerodromes; the air risk is intrinsically reduced**
- B. Drones cannot fly higher
- C. Fuel saving

### v. Vispārīgas zināšanas par UAS

**Q10.** A C5 UAS class is reserved for…
- ✅ **A. STS-01-aligned operations (VLOS, controlled ground area, populated)**
- B. Any open-category use
- C. Indoor flights only

**Q11.** A C6 UAS class is reserved for…
- ✅ **A. STS-02-aligned operations (BVLOS, sparsely populated, with observers)**
- B. Heavy lift > 25 kg
- C. Aerobatic UAS

### vi. Meteoroloģija (если без A2)

**Q12.** Operating BVLOS in winter at -10 °C, what battery effect must you account for?
- ✅ **A. ~30–50 % capacity loss; pre-warm packs + plan shorter sortie + monitor voltage drop earlier**
- B. No impact
- C. Faster discharge only at takeoff

### vii. UAS lidojuma veiktspēja

**Q13.** A 25 kg fixed-wing UAS at MTOM has a stall speed of 18 m/s. In a 14 m/s headwind component on final approach, what is the ground speed at stall?
- ✅ **A. 4 m/s** (18 − 14)
- B. 32 m/s
- C. 18 m/s

### viii. Zemes risku mazināšana

**Q14.** You operate STS-01 over a controlled ground area with crowd 90 m horizontally outside the area. The flight geography (FG) is 50 m. Contingency volume (CV) extends 30 m beyond FG. What separation remains to the crowd from the CV edge?
- ✅ **A. 90 − 30 = 60 m → check ground risk buffer (GRB) for parachute terminal velocity descent**
- B. 30 m
- C. 90 m

> SORA Step #4: GRB depends on UAS terminal velocity. См. `latvia-caa/Risku_novertejums-SORA_metodologija-VADLINIJAS-V1_2.pdf`.

## КЛЮЧЕВЫЕ ССЫЛКИ ДЛЯ ПОДГОТОВКИ

- **Latvia CAA STS topics PDF:** `latvia-caa/STS_eksamena_temas-V1.pdf`
- **EASA Easy Access Rules UAS** (468 pp): `easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf` — глава Specific Category
- **SORA methodology guidelines (LV):** `latvia-caa/Risku_novertejums-SORA_metodologija-VADLINIJAS-V1_2.pdf`
- **Operating manual guidelines (LV):** `latvia-caa/UAS_ekspluatacijas_rokasgramata-VADLINIJAS-V1_1.pdf`
- **PDRA-S01/S02/G01–G03 templates:** `latvia-caa/web-snapshots/10-operating-permits.md` + linked DOCX
- **ProFlyCenter STS-T mock exam (DE):** https://ace.easy-lms.com/de/sts-testprufung-by-proflycenter/

> Coмерческие банки: ProFlyCenter (DE/EN), DronuEksāmeni.lv (LV — sagatavošanās).
