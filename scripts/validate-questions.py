#!/usr/bin/env python3
from __future__ import annotations

import glob
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_DIR = ROOT / "content" / "questions"
KNOWLEDGE_DIR = ROOT / "docs" / "knowledge"

RE_ID = re.compile(r"^(?P<prefix>[a-z]+)-(?P<num>\d{3})$")


@dataclass
class Err:
  path: str
  qid: str | None
  msg: str


def die(errors: list[Err]) -> None:
  for e in errors:
    loc = f"{e.path}"
    if e.qid:
      loc += f" ({e.qid})"
    print(f"ERROR: {loc}: {e.msg}", file=sys.stderr)
  raise SystemExit(1)


def require_langs(v: Any, path: str, qid: str, field: str, errors: list[Err]) -> None:
  if not isinstance(v, dict):
    errors.append(Err(path, qid, f"{field} must be a mapping with lv/en/ru"))
    return
  for lang in ("lv", "en", "ru"):
    if not isinstance(v.get(lang), str) or not v.get(lang).strip():
      errors.append(Err(path, qid, f"missing {field}.{lang}"))


def parse_source_ref(ref: Any) -> tuple[str | None, str]:
  if not isinstance(ref, str) or not ref.strip():
    return None, "sourceRef must be a non-empty string"
  if not ref.startswith("docs/knowledge/"):
    return None, 'sourceRef must start with "docs/knowledge/"'
  doc = ref.split(" — ", 1)[0]
  return doc, ""


def validate_file(path: str, errors: list[Err]) -> None:
  raw = Path(path).read_text(encoding="utf-8")
  try:
    data = yaml.safe_load(raw)
  except Exception as exc:  # noqa: BLE001
    errors.append(Err(path, None, f"YAML parse failed: {exc}"))
    return

  if not isinstance(data, list):
    errors.append(Err(path, None, "top-level YAML must be a list of questions"))
    return

  topic = Path(path).stem
  ids: list[str] = []
  for idx, q in enumerate(data):
    if not isinstance(q, dict):
      errors.append(Err(path, None, f"question #{idx+1} must be a mapping"))
      continue

    qid = q.get("id")
    if not isinstance(qid, str) or not qid.strip():
      errors.append(Err(path, None, f"question #{idx+1} missing id"))
      continue
    ids.append(qid)

    m = RE_ID.match(qid)
    if not m:
      errors.append(Err(path, qid, "id must match <prefix>-<3 digits> (e.g. as-001)"))
    else:
      prefix = m.group("prefix")
      file_prefix = topic.split("-")[0]  # best-effort; we also check numeric sequence below
      if prefix == file_prefix:
        # ok
        pass

    require_langs(q.get("stem"), path, qid, "stem", errors)
    require_langs(q.get("explanation"), path, qid, "explanation", errors)

    options = q.get("options")
    if not isinstance(options, list) or len(options) != 4:
      errors.append(Err(path, qid, "options must be a list of exactly 4 items"))
      continue

    opt_ids: list[str] = []
    for opt in options:
      if not isinstance(opt, dict):
        errors.append(Err(path, qid, "each option must be a mapping"))
        continue
      oid = opt.get("id")
      if oid not in ("a", "b", "c", "d"):
        errors.append(Err(path, qid, "option ids must be a/b/c/d"))
        continue
      if oid in opt_ids:
        errors.append(Err(path, qid, f"duplicate option id: {oid}"))
      opt_ids.append(oid)
      require_langs(opt.get("text"), path, qid, f"options[{oid}].text", errors)

    correct = q.get("correctOptionId")
    if correct not in ("a", "b", "c", "d"):
      errors.append(Err(path, qid, "correctOptionId must be one of a/b/c/d"))

    dr = q.get("distractorRationales")
    if not isinstance(dr, dict):
      errors.append(Err(path, qid, "distractorRationales must be present and a mapping"))
    else:
      if correct in dr:
        errors.append(Err(path, qid, "distractorRationales must not include the correct option"))
      wrong = {x for x in ("a", "b", "c", "d") if x != correct}
      if set(dr.keys()) != wrong:
        errors.append(Err(path, qid, f"distractorRationales keys must be exactly {sorted(wrong)}"))
      for k, v in dr.items():
        require_langs(v, path, qid, f"distractorRationales.{k}", errors)

    doc, err = parse_source_ref(q.get("sourceRef"))
    if err:
      errors.append(Err(path, qid, err))
    elif doc:
      doc_path = ROOT / doc
      if not doc_path.exists():
        errors.append(Err(path, qid, f"sourceRef doc does not exist: {doc}"))
      else:
        try:
          doc_path.relative_to(KNOWLEDGE_DIR)
        except ValueError:
          errors.append(Err(path, qid, f"sourceRef doc must be under docs/knowledge/: {doc}"))

    for k in ("difficulty", "cognitiveLevel", "scenarioType"):
      if k not in q:
        errors.append(Err(path, qid, f"missing {k}"))

  # Unique ids + sequential numbering check (per-file)
  dupes = {i for i in ids if ids.count(i) > 1}
  for d in sorted(dupes):
    errors.append(Err(path, d, "duplicate question id in file"))

  nums = []
  for i in ids:
    m = RE_ID.match(i)
    if m:
      nums.append(int(m.group("num")))
  if nums:
    expected = list(range(min(nums), max(nums) + 1))
    if sorted(nums) != expected:
      errors.append(Err(path, None, f"question numbering must be contiguous; got {min(nums)}..{max(nums)} with gaps"))


def main() -> None:
  errors: list[Err] = []
  files = sorted(glob.glob(str(QUESTIONS_DIR / "*.yml")))
  if not files:
    print("No question files found under content/questions/", file=sys.stderr)
    raise SystemExit(2)

  for path in files:
    validate_file(path, errors)

  if errors:
    die(errors)

  print(f"OK: validated {len(files)} files")


if __name__ == "__main__":
  main()

