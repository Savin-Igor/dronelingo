import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { migrateSourceRef } from "../src/lib/source-citations";

const ROOT = resolve(process.cwd(), "content");

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

function rewriteYamlFile(file: string) {
  const raw = readFileSync(file, "utf8");
  const lines = raw.split("\n");
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\s*)sourceRef:\s*(.+)\s*$/);
    if (!match) continue;

    const [, indent, rawValue] = match;
    const value = rawValue
      .trim()
      .replace(/^"/, "")
      .replace(/"$/, "")
      .replace(/^'/, "")
      .replace(/'$/, "");
    const migrated = migrateSourceRef(value);
    if (!migrated.sourceRef) continue;

    const nextIndex = i + 1;
    lines[i] = `${indent}sourceRef: ${JSON.stringify(migrated.sourceRef)}`;
    changed = true;

    if (migrated.internalRef) {
      const internalLine = `${indent}internalRef: ${JSON.stringify(migrated.internalRef)}`;
      if (lines[nextIndex]?.match(new RegExp(`^${indent}internalRef:`))) {
        if (lines[nextIndex] !== internalLine) {
          lines[nextIndex] = internalLine;
        }
      } else {
        lines.splice(nextIndex, 0, internalLine);
        i++;
      }
    }
  }

  if (changed) {
    writeFileSync(file, lines.join("\n"), "utf8");
  }
  return changed;
}

function main() {
  const files = [
    ...listFiles(join(ROOT, "questions"), (name) => name.endsWith(".yml")),
    ...listFiles(join(ROOT, "lessons"), (name) => name === "meta.yml"),
    ...listFiles(join(ROOT, "blog"), (name) => name === "meta.yml"),
  ];

  let changed = 0;
  for (const file of files) {
    if (rewriteYamlFile(file)) changed++;
  }

  console.log(`Updated ${changed} files`);
}

main();
