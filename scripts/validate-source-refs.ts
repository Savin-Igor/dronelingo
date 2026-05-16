import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { hasBareUrlEntry, hasLinkedCitation } from "../src/lib/source-citations";

const REPO_ROOT = resolve(process.cwd());
const ROOT = resolve(REPO_ROOT, "content");

type Failure = {
  file: string;
  message: string;
};

function listTrackedContentFiles(): { questionFiles: string[]; metaFiles: string[] } {
  const tracked = execFileSync(
    "git",
    ["ls-files", "content/questions", "content/lessons", "content/blog"],
    { cwd: REPO_ROOT, encoding: "utf8" },
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => resolve(REPO_ROOT, line));

  return {
    questionFiles: tracked.filter((file) => file.startsWith(join(ROOT, "questions")) && file.endsWith(".yml")),
    metaFiles: tracked.filter(
      (file) =>
        (file.startsWith(join(ROOT, "lessons")) || file.startsWith(join(ROOT, "blog"))) &&
        file.endsWith("/meta.yml"),
    ),
  };
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
    if (hasBareUrlEntry(q.sourceRef)) {
      return [
        {
          file,
          message: `question ${q.id ?? index + 1}: sourceRef must use 'citation | public URL' instead of bare URLs`,
        },
      ];
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
  if (hasBareUrlEntry(meta.sourceRef)) {
    return [{ file, message: "sourceRef must use 'citation | public URL' instead of bare URLs" }];
  }
  if (!hasLinkedCitation(meta.sourceRef) && !meta.internalRef) {
    return [{ file, message: "sourceRef needs at least one public link or internalRef" }];
  }
  return [];
}

function main() {
  const { questionFiles, metaFiles } = listTrackedContentFiles();

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
