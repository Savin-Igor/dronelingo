const EASA_UAS_RULES_URL =
  "https://www.easa.europa.eu/en/document-library/easy-access-rules/easy-access-rules-unmanned-aircraft-systems-regulations-eu";
const EUR_LEX_2019_947_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019R0947";
const EUR_LEX_2019_945_URL =
  "https://eur-lex.europa.eu/eli/reg_del/2019/945/oj/eng";
const EUR_LEX_GDPR_URL =
  "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng";
const EUR_LEX_785_2004_URL =
  "https://eur-lex.europa.eu/eli/reg/2004/785/oj/eng";
const CAA_QUALIFICATIONS_URL =
  "https://droni.caa.gov.lv/talvadibas-pilotu-kvalifikacija/";
const CAA_A1_A3_URL =
  "https://droni.caa.gov.lv/talvadibas-pilotu-kvalifikacija/a1-a3-tiessaistes-apmacibu-kurss-un-eksamens/";
const CAA_A2_URL =
  "https://droni.caa.gov.lv/talvadibas-pilotu-kvalifikacija/a2-apakskategorijas-teoretisko-zinasanu-eksamens/";
const CAA_OPEN_CATEGORY_URL =
  "https://droni.caa.gov.lv/darbibas-kategorijas/atverta-kategorija/";
const CAA_REGISTRATION_URL =
  "https://droni.caa.gov.lv/registracija/";
const CAA_GEOZONES_URL =
  "https://droni.caa.gov.lv/bgkis/ugz/lidojumu-pieteiksana-un-saskanosana-uas-geografiskajas-zonas/";
const CAA_INSURANCE_URL =
  "https://droni.caa.gov.lv/apdrosinasanas-prasibas/";
const CAA_CONTACTS_URL = "https://droni.caa.gov.lv/kontakti/";
const CAA_RULES_URL = "https://droni.caa.gov.lv/normativais-regulejums/";
const CAA_FLYING_ABROAD_URL =
  "https://droni.caa.gov.lv/lidojumi-ar-dronu-citas-valstis/";
const CAA_INCIDENTS_URL =
  "https://www.caa.gov.lv/en/services/reporting-occurrences-civil-aviation";
const CAA_LOCAL_CONDITIONS_URL =
  "https://droni.caa.gov.lv/vadlinijas/UAS-CBO-LVA-Local_conditions-V1_2-2024_04_30.pdf";
const CAA_GEOZONES_PDF_URL =
  "https://droni.caa.gov.lv/vadlinijas/2024_11_27-CAA-Par_UAS_geografiskajam_zonam.pdf";
const ENISA_TRANSPORT_URL =
  "https://www.enisa.europa.eu/topics/cybersecurity-of-critical-sectors/transport";
const IATA_LITHIUM_BATTERY_GUIDANCE_URL =
  "https://www.iata.org/contentassets/05e6d8742b0047259bf3a700bc9d42b9/lithium-battery-guidance-document.pdf";

const INTERNAL_SOURCE_PATHS: Record<string, string> = {
  [EUR_LEX_2019_947_URL]: "/regulations/reg-eu-2019-947",
  [EUR_LEX_2019_945_URL]: "/regulations/reg-eu-2019-945",
  [EASA_UAS_RULES_URL]: "/regulations/easa-easy-access-rules",
  [CAA_QUALIFICATIONS_URL]: "/regulations/caa-lv-qualifications",
  [CAA_A1_A3_URL]: "/regulations/caa-lv-qualifications",
  [CAA_A2_URL]: "/regulations/caa-lv-qualifications",
  [CAA_REGISTRATION_URL]: "/regulations/caa-lv-registration",
  [CAA_GEOZONES_URL]: "/regulations/caa-lv-geozones",
  [CAA_INSURANCE_URL]: "/regulations/caa-lv-insurance",
};

export function getInternalUrl(url: string | null): string | null {
  if (!url) return null;
  return INTERNAL_SOURCE_PATHS[url] ?? null;
}

export type SourceCitation = {
  label: string;
  url: string | null;
};

function pathToLabel(path: string): string {
  const labels: Record<string, string> = {
    "docs/knowledge/easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf":
      "EASA Easy Access Rules for UAS (2024-07)",
    "docs/knowledge/eu-regulations/EU-2019-947-implementing-regulation-EN.pdf":
      "Regulation (EU) 2019/947",
    "docs/knowledge/eu-regulations/Reg-2019-947.pdf":
      "Regulation (EU) 2019/947",
    "docs/knowledge/eu-regulations/EU-2019-945-delegated-regulation-EN.pdf":
      "Regulation (EU) 2019/945",
    "docs/knowledge/eu-regulations/": "EU regulations",
    "docs/knowledge/latvia-caa/UAS-CBO-LVA-Local_conditions-V1_2-2024_04_30.pdf":
      "CAA Latvia local conditions for UAS operations",
    "docs/knowledge/latvia-caa/2024_11_27-CAA-Par_UAS_geografiskajam_zonam.pdf":
      "CAA Latvia UAS geographical zones guidance",
    "docs/knowledge/latvia-caa/web-snapshots/":
      "CAA Latvia drone guidance",
    "docs/knowledge/latvia-caa/web-snapshots/01-talvadibas-pilotu-kvalifikacija.md":
      "CAA Latvia remote pilot qualifications",
    "docs/knowledge/latvia-caa/web-snapshots/02-a1-a3-online-exam.md":
      "CAA Latvia A1/A3 online exam",
    "docs/knowledge/latvia-caa/web-snapshots/03-a2-theoretical-exam.md":
      "CAA Latvia A2 theoretical exam",
    "docs/knowledge/latvia-caa/web-snapshots/07-open-category.md":
      "CAA Latvia open category guidance",
    "docs/knowledge/latvia-caa/web-snapshots/08-registracija.md":
      "CAA Latvia operator registration",
    "docs/knowledge/latvia-caa/web-snapshots/11-geographical-zones.md":
      "CAA Latvia UAS geographical zones",
    "docs/knowledge/latvia-caa/web-snapshots/12-insurance.md":
      "CAA Latvia insurance requirements",
    "docs/knowledge/latvia-caa/web-snapshots/13-contacts.md":
      "CAA Latvia contacts",
    "docs/knowledge/latvia-caa/web-snapshots/14-normativais-regulejums.md":
      "CAA Latvia regulatory framework",
    "docs/knowledge/latvia-caa/web-snapshots/16-flying-outside-latvia.md":
      "CAA Latvia flying abroad guidance",
    "docs/knowledge/latvia-caa/web-snapshots/17-incident-reporting.md":
      "CAA Latvia occurrence reporting",
    "docs/knowledge/test-samples/A2-question-bank.md":
      "CAA Latvia A2 exam sample structure",
    "docs/knowledge/training-guides/":
      "Training guidance used for authoring",
    "docs/knowledge/training-guides/EASA-QA-UAS-regulations.pdf":
      "EASA Q&A on UAS regulations",
    "docs/knowledge/training-guides/EASA-open-category-rules.pdf":
      "EASA open-category rules guidance",
    "docs/knowledge/training-guides/Montenegro-CAA-A1-A3-theoretical-knowledge-training.pdf":
      "A1/A3 theoretical training guidance",
    "docs/knowledge/training-guides/syllabus/A1-A3-detailed-syllabus.md":
      "A1/A3 detailed syllabus",
    "docs/knowledge/training-guides/syllabus/A2-detailed-syllabus.md":
      "A2 detailed syllabus",
  };
  return labels[path] ?? path;
}

function cleanupLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function pathToUrl(path: string, label: string): string | null {
  if (path === "docs/knowledge/easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf") {
    return EASA_UAS_RULES_URL;
  }
  if (
    path === "docs/knowledge/eu-regulations/EU-2019-947-implementing-regulation-EN.pdf" ||
    path === "docs/knowledge/eu-regulations/Reg-2019-947.pdf"
  ) {
    return EUR_LEX_2019_947_URL;
  }
  if (path === "docs/knowledge/eu-regulations/EU-2019-945-delegated-regulation-EN.pdf") {
    return EUR_LEX_2019_945_URL;
  }
  if (path === "docs/knowledge/eu-regulations/") {
    return /GDPR|2016\/679|privacy/i.test(label)
      ? EUR_LEX_GDPR_URL
      : EUR_LEX_2019_947_URL;
  }
  if (path === "docs/knowledge/latvia-caa/UAS-CBO-LVA-Local_conditions-V1_2-2024_04_30.pdf") {
    return CAA_LOCAL_CONDITIONS_URL;
  }
  if (path === "docs/knowledge/latvia-caa/2024_11_27-CAA-Par_UAS_geografiskajam_zonam.pdf") {
    return CAA_GEOZONES_PDF_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/") {
    return /incident/i.test(label) ? CAA_INCIDENTS_URL : CAA_QUALIFICATIONS_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/01-talvadibas-pilotu-kvalifikacija.md") {
    return CAA_QUALIFICATIONS_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/02-a1-a3-online-exam.md") {
    return CAA_A1_A3_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/03-a2-theoretical-exam.md") {
    return CAA_A2_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/07-open-category.md") {
    return CAA_OPEN_CATEGORY_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/08-registracija.md") {
    return CAA_REGISTRATION_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/11-geographical-zones.md") {
    return CAA_GEOZONES_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/12-insurance.md") {
    return CAA_INSURANCE_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/13-contacts.md") {
    return CAA_CONTACTS_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/14-normativais-regulejums.md") {
    return CAA_RULES_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/16-flying-outside-latvia.md") {
    return CAA_FLYING_ABROAD_URL;
  }
  if (path === "docs/knowledge/latvia-caa/web-snapshots/17-incident-reporting.md") {
    return CAA_INCIDENTS_URL;
  }
  if (path === "docs/knowledge/test-samples/A2-question-bank.md") {
    return CAA_A2_URL;
  }
  if (path === "docs/knowledge/training-guides/") {
    return CAA_QUALIFICATIONS_URL;
  }
  if (path === "docs/knowledge/training-guides/EASA-QA-UAS-regulations.pdf") {
    return EASA_UAS_RULES_URL;
  }
  if (path === "docs/knowledge/training-guides/EASA-open-category-rules.pdf") {
    return CAA_OPEN_CATEGORY_URL;
  }
  if (path === "docs/knowledge/training-guides/Montenegro-CAA-A1-A3-theoretical-knowledge-training.pdf") {
    return CAA_A1_A3_URL;
  }
  if (path === "docs/knowledge/training-guides/syllabus/A1-A3-detailed-syllabus.md") {
    return CAA_A1_A3_URL;
  }
  if (path === "docs/knowledge/training-guides/syllabus/A2-detailed-syllabus.md") {
    return CAA_A2_URL;
  }
  return null;
}

function parseLegacyItem(item: string): SourceCitation {
  const trimmed = cleanupLabel(item);
  if (!trimmed) return { label: "", url: null };
  if (/^https?:\/\//.test(trimmed)) {
    return { label: trimmed, url: trimmed };
  }

  const [path, ...rest] = trimmed.split(" — ");
  const label = cleanupLabel(
    rest.length > 0 ? rest.join(" — ") : pathToLabel(path),
  );
  const inferredUrl = inferUrlFromLabel(label);
  return {
    label,
    url: path.startsWith("docs/knowledge/")
      ? pathToUrl(path, label)
      : inferredUrl,
  };
}

export function parseSourceRef(value: string | null | undefined): SourceCitation[] {
  if (!value) return [];

  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [labelPart, urlPart] = item.split("|").map((part) => part.trim());
      if (urlPart) {
        return { label: cleanupLabel(labelPart), url: urlPart };
      }
      return parseLegacyItem(item);
    })
    .filter((citation) => citation.label.length > 0);
}

export function hasLinkedCitation(value: string | null | undefined): boolean {
  return parseSourceRef(value).some((citation) => Boolean(citation.url));
}

export function hasBareUrlEntry(value: string | null | undefined): boolean {
  if (!value) return false;

  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .some((item) => /^https?:\/\//.test(item) && !item.includes("|"));
}

export function serializeSourceRef(citations: SourceCitation[]): string {
  return citations
    .map((citation) =>
      citation.url ? `${citation.label} | ${citation.url}` : citation.label,
    )
    .join("; ");
}

function labelFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const labels: Record<string, string> = {
      "eur-lex.europa.eu": "EUR-Lex official text",
      "easa.europa.eu": "EASA official guidance",
      "droni.caa.gov.lv": "CAA Latvia guidance",
      "caa.gov.lv": "CAA Latvia service page",
      "likumi.lv": "Likumi.lv",
      "rusi.org": "RUSI analysis",
      "csis.org": "CSIS analysis",
      "army.mil": "U.S. Army article",
      "act.nato.int": "NATO ACT paper",
      "defensedaily.com": "Defense Daily report",
      "shield.ai": "Shield AI",
      "skydio.com": "Skydio",
      "helsing.ai": "Helsing",
      "twz.com": "The War Zone",
      "enterprise.dji.com": "DJI Enterprise",
      "autelrobotics.com": "Autel Robotics",
      "flir.com": "Teledyne FLIR",
    };
    return labels[host] ?? host;
  } catch {
    return url;
  }
}

function inferUrlFromLabel(label: string): string | null {
  if (/airspace\.lv\/drones/i.test(label)) return "https://airspace.lv/drones";
  if (/ais\.lgs\.lv\/page\/UAS_geozones/i.test(label)) {
    return "https://ais.lgs.lv/page/UAS_geozones";
  }
  if (/e\.caa\.gov\.lv\/incidents/i.test(label)) {
    return "https://e.caa.gov.lv/incidents";
  }
  if (/e\.caa\.gov\.lv/i.test(label)) return "https://e.caa.gov.lv";
  if (/2016\/679|GDPR|Datu valsts inspekcija|dvi\.gov\.lv/i.test(label)) {
    return EUR_LEX_GDPR_URL;
  }
  if (/785\/2004|civiltiesisko apdrošināšanu/i.test(label)) {
    return EUR_LEX_785_2004_URL;
  }
  if (/2019\/945/i.test(label)) return EUR_LEX_2019_945_URL;
  if (/2019\/947|UAS\.OPEN|Open category|Subcategories/i.test(label)) {
    return EUR_LEX_2019_947_URL;
  }
  if (/Easy Access Rules|AMC1|AMC\/GM|IMSAFE|human performance|EASA HF guidance/i.test(label)) {
    return EASA_UAS_RULES_URL;
  }
  if (/Emergency procedures|manufacturer manuals/i.test(label)) {
    return EASA_UAS_RULES_URL;
  }
  if (/BGKIS|UAS geographical zones|UGZ|airspace classes|NOTAM|Riga CTR|geo-awareness/i.test(label)) {
    return CAA_GEOZONES_URL;
  }
  if (/ENISA|GNSS spoofing|jamming|cyber security/i.test(label)) {
    return ENISA_TRANSPORT_URL;
  }
  if (/battery safety|Lithium Battery Guidance/i.test(label)) {
    return IATA_LITHIUM_BATTERY_GUIDANCE_URL;
  }
  if (/insurance/i.test(label)) return CAA_INSURANCE_URL;
  if (/incident|occurrence reporting|safety follow-up/i.test(label)) {
    return CAA_INCIDENTS_URL;
  }
  if (/registration|operator number|expluatant|operator and insurance practice/i.test(label)) {
    return CAA_REGISTRATION_URL;
  }
  if (/A2|sample structure/i.test(label)) return CAA_A2_URL;
  if (/A1\/A3|remote pilot qualifications|syllabus|training guidance/i.test(label)) {
    return CAA_A1_A3_URL;
  }
  if (/contacts/i.test(label)) return CAA_CONTACTS_URL;
  if (/critical infrastructure|regulatory framework|national rules|MK noteikumi|Cabinet Regulation/i.test(label)) {
    return CAA_RULES_URL;
  }
  return null;
}

export function migrateSourceRef(
  value: string | null | undefined,
): { sourceRef: string | null; internalRef: string | null } {
  if (!value) {
    return { sourceRef: null, internalRef: null };
  }

  const citations = value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (item.includes("|")) {
        const [label, url] = item.split("|").map((part) => part.trim());
        return { label: cleanupLabel(label), url: url || null };
      }
      if (/^https?:\/\//.test(item)) {
        return { label: labelFromUrl(item), url: item };
      }
      return parseLegacyItem(item);
    })
    .filter((citation) => citation.label.length > 0);

  return {
    sourceRef: citations.length > 0 ? serializeSourceRef(citations) : null,
    internalRef: value.includes("docs/knowledge/") ? value : null,
  };
}
