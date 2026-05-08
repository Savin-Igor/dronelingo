#!/usr/bin/env bash
# PreToolUse hook: block writes to docs/knowledge/.
# Reads Claude Code's tool-call JSON on stdin, extracts tool_input.file_path,
# blocks (exit 2) if the path is inside docs/knowledge/.

set -euo pipefail

FILE=$(python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
p = (d.get("tool_input") or {}).get("file_path") or ""
print(p)
')

case "$FILE" in
  *docs/knowledge/*)
    cat >&2 <<'EOF'
docs/knowledge/ is read-only.

It stores dated source-of-truth snapshots (PDFs from EU/EASA/CAA Latvia,
markdown captures of droni.caa.gov.lv from 2026-05-08). Editing them
silently corrupts provenance.

Refresh by re-downloading from the original source — do not edit.
EOF
    exit 2
    ;;
esac
exit 0
