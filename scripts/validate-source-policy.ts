import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const POLICY_FILE = resolve(process.cwd(), "content/sources/policy.yml");

const SourceFamilySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  examples: z.array(z.string().min(1)).min(1),
  sourceTypes: z.array(z.enum(["html", "pdf", "md"])).min(1),
  mirroringPolicy: z.enum(["full", "summary-only", "outbound-only"]),
  licenseStatus: z.enum(["reviewed", "unclear", "restricted"]),
  publicRendering: z.enum(["allowed", "limited", "disallowed"]),
  canonicalStrategy: z.enum([
    "first-party-canonical",
    "summary-canonical",
    "outbound-primary",
  ]),
  rawStorage: z.enum(["git-reviewed", "external-only"]),
  searchEligibility: z.enum(["full", "lexical", "metadata-only"]),
  notes: z.string().min(1),
});

const PolicySchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rulesetIssue: z.number().int().positive(),
  rulesetSummary: z.string().min(1),
  sourceFamilies: z.array(SourceFamilySchema).min(1),
});

function main() {
  const raw = parseYaml(readFileSync(POLICY_FILE, "utf8"));
  const policy = PolicySchema.parse(raw);

  const ids = new Set<string>();
  for (const family of policy.sourceFamilies) {
    if (ids.has(family.id)) {
      throw new Error(`duplicate source family id: ${family.id}`);
    }
    ids.add(family.id);
  }

  const hasAllTiers = new Set(policy.sourceFamilies.map((family) => family.mirroringPolicy));
  for (const tier of ["full", "summary-only", "outbound-only"] as const) {
    if (!hasAllTiers.has(tier)) {
      throw new Error(`policy registry must include at least one '${tier}' source family`);
    }
  }

  console.log(`OK: validated source policy registry with ${policy.sourceFamilies.length} source families`);
}

main();
