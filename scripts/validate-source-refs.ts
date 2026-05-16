import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { hasLinkedCitation } from "../src/lib/source-citations";

const ROOT = resolve(process.cwd(), "content");

type Failure = {
  file: string;
  message: string;
};

function listFiles(dir: string, matcher: (name: string) => boolean, acc: string[] = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(full, matcher, acc);
    } else if (matcher(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function validateQuestionFile(file: string): Failure[] {
  const raw = parseYaml(readFileSync(file, "utf8"));
  if (!Array.isArray(raw)) {
    return [{ file, message: "top-level YAML must be a list" }];
  }

  return raw.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") {
      return [{ file, message: `entry ${index + 1} must be an object` }];
    }
    const q = entry as { id?: string; sourceRef?: string; internalRef?: string };
    if (!q.sourceRef) {
      return [{ file, message: `question ${q.id ?? index + 1}: missing sourceRef` }];
    }
    if (!hasLinkedCitation(q.sourceRef) && !q.internalRef) {
      return [
        {
          file,
          message: `question ${q.id ?? index + 1}: sourceRef needs at least one public link or internalRef`,
        },
      ];
    }
    return [];
  });
}

function validateMetaFile(file: string): Failure[] {
  const raw = parseYaml(readFileSync(file, "utf8"));
  if (!raw || typeof raw !== "object") return [];
  const meta = raw as { sourceRef?: string; internalRef?: string };
  if (!meta.sourceRef) return [];
  if (!hasLinkedCitation(meta.sourceRef) && !meta.internalRef) {
    return [{ file, message: "sourceRef needs at least one public link or internalRef" }];
  }
  return [];
}

function main() {
  const questionFiles = listFiles(join(ROOT, "questions"), (name) => name.endsWith(".yml"));
  const metaFiles = [
    ...listFiles(join(ROOT, "lessons"), (name) => name === "meta.yml"),
    ...listFiles(join(ROOT, "blog"), (name) => name === "meta.yml"),
  ];

  const failures = [
    ...questionFiles.flatMap(validateQuestionFile),
    ...metaFiles.flatMap(validateMetaFile),
  ];

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`ERROR: ${failure.file}: ${failure.message}`);
    }
    process.exit(1);
  }

  console.log(
    `OK: validated source refs in ${questionFiles.length} question files and ${metaFiles.length} meta files`,
  );
}

main();
