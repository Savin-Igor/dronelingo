#!/usr/bin/env bash
# Validate that a question YAML's `sourceFile:` value resolves to a real file
# under docs/knowledge/. Run from the repo root.
#
# Usage:
#   validate.sh <path-relative-to-docs/knowledge>   # check a literal path
#   validate.sh --file <yaml-path>                  # extract sourceFile: from a YAML
#
# Exit codes:
#   0 — OK
#   1 — usage error
#   2 — sourceFile missing in YAML
#   3 — file does not exist under docs/knowledge/

set -euo pipefail

KNOWLEDGE_DIR="docs/knowledge"

usage() {
  echo "Usage: $0 <relative-path> | --file <yaml-path>" >&2
  exit 1
}

if [[ $# -eq 0 ]]; then
  usage
fi

if [[ ! -d "$KNOWLEDGE_DIR" ]]; then
  echo "ERROR: $KNOWLEDGE_DIR not found — run from repo root." >&2
  exit 1
fi

if [[ "$1" == "--file" ]]; then
  [[ $# -eq 2 ]] || usage
  yaml_path="$2"
  [[ -f "$yaml_path" ]] || { echo "ERROR: YAML not found: $yaml_path" >&2; exit 1; }
  rel_path=$(awk -F': *' '
    /^sourceFile:/ {
      val=$2
      gsub(/^["'\'']|["'\'']$/, "", val)
      gsub(/[[:space:]]+$/, "", val)
      print val
      exit
    }
  ' "$yaml_path")
  if [[ -z "$rel_path" ]]; then
    echo "ERROR: sourceFile: is missing or empty in $yaml_path" >&2
    exit 2
  fi
else
  rel_path="$1"
fi

# Reject path traversal and absolute paths.
case "$rel_path" in
  /*|*..*)
    echo "ERROR: sourceFile must be a relative path under $KNOWLEDGE_DIR (got: $rel_path)" >&2
    exit 3
    ;;
esac

full_path="$KNOWLEDGE_DIR/$rel_path"
if [[ ! -e "$full_path" ]]; then
  echo "ERROR: sourceFile does not exist: $full_path" >&2
  echo "Hint: list candidates with: ls $KNOWLEDGE_DIR" >&2
  exit 3
fi

echo "OK: $full_path"
