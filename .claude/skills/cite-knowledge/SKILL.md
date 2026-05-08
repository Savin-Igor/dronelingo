---
name: cite-knowledge
description: Enforce that any regulatory or operational claim about EU/Latvia drone rules is backed by a citation into docs/knowledge/. Loads automatically when generating lesson MDX, question rationales, FAQ entries, registration-guide steps, or any answer that asserts what the law/CAA says. Do not paraphrase from training data — quote the knowledge base.
user-invocable: false
---

# cite-knowledge

This project's content must be traceable. Every factual claim about EU drone regulation (Reg 2019/947, 2019/945, amendments), EASA AMC/GM, or Latvia CAA practice must cite a file inside `docs/knowledge/`.

## When this skill applies

- Writing or editing lesson MDX (`content/lessons/`).
- Writing question stems, options, or rationales (`content/questions/`).
- Writing FAQ, ToS, registration guide, or any user-facing copy that makes a regulatory claim.
- Answering the user's questions about what the rules are or how the Latvia exam works.

If the work is purely UI/code/infra — this skill does not apply.

## Citation format

Every claim carries:

1. **Human-readable reference** — article number, paragraph, or page. Examples:
   - `Reg 2019/947 Art. UAS.OPEN.060`
   - `MK Nr. 248 §53`
   - `EASA Easy Access Rules (2024-07) p. 142`
   - `droni.caa.gov.lv — atzītās struktūras (snapshot 2026-05-08)`
2. **File path** under `docs/knowledge/` that backs the reference.

In MDX, use a footnote or inline `<Cite>` component. In YAML question files, use the `sourceRef` + `sourceFile` fields (see `seed-question` skill).

## Rules

1. **Never paraphrase a regulation from training data.** Open the file in `docs/knowledge/` first; if you cannot find it there, say so and ask the user before continuing.
2. **Web-snapshots are dated.** `docs/knowledge/latvia-caa/web-snapshots/*.md` carries `captured:` frontmatter (most recently `2026-05-08`). When citing operational facts that may drift (fees, contacts, exam organizers), reproduce the date alongside the citation.
3. **Prefer the consolidated text.** For Reg 2019/947 / 2019/945 cite `easa/EASA-Easy-Access-Rules-UAS-2024-07.pdf` over the un-amended OJ originals when both apply.
4. **Reject "common knowledge" framing.** Statements like "drone pilots usually..." or "the standard rule is..." without a citation are not acceptable in user-facing content.
5. **National law over EU summary** when contradictions appear. Latvia CAA snapshots and `MK noteikumi Nr. 248/436/437/447/457/627` define the local application.

## Failure mode

If a claim is needed and no file in `docs/knowledge/` covers it:

- Stop. Tell the user which claim cannot be backed.
- Suggest either (a) adding the source to the knowledge base, or (b) rephrasing the claim to drop the unsupported detail.
- Do not proceed with an unsourced claim, even temporarily.
