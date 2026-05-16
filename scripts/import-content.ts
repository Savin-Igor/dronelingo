/**
 * Idempotent content importer for dronelingo.
 *
 * Reads YAML topics, MDX lessons, and YAML question banks from `content/`
 * and UPSERTs them into Postgres via Prisma.
 *
 * Usage:
 *   tsx scripts/import-content.ts
 *
 * Layout (see .claude/plans/content-importer.md for the full contract):
 *   content/topics/<slug>.yml
 *   content/lessons/<topic-slug>/<lesson-slug>/{meta.yml, lv.mdx, en.mdx, ru.mdx}
 *   content/questions/<topic-slug>.yml
 *
 * Idempotency: re-running with no file changes performs UPSERTs that touch
 * `updatedAt` but produce no logical diff. The summary distinguishes
 * created vs updated rows for the current run.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { PrismaClient, Prisma } from "@prisma/client";

const CONTENT_DIR = resolve(process.cwd(), "content");

// ── Validation schemas ────────────────────────────────────────────────────

const Multilingual = z
  .record(z.string(), z.string().min(1))
  .refine((v) => typeof v.en === "string" && v.en.length > 0, {
    message: "missing required `en` fallback",
  });

const TopicYaml = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  ord: z.number().int().nonnegative(),
  title: Multilingual,
  summary: Multilingual,
});

// Lesson anatomy block ids — the 9 blocks defined in academy-vision.md.
const LessonBlockId = z.enum([
  "missionBriefing",
  "cinematicScene",
  "core",
  "artefact",
  "scenario",
  "memoryAnchor",
  "commonMistakes",
  "miniQuiz",
  "debrief",
]);

const LessonMetaYaml = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  ord: z.number().int().nonnegative(),
  title: Multilingual,
  sourceRef: z.string().min(1).optional(),
  internalRef: z.string().min(1).optional(),
  // Declared list of academy blocks present in this lesson's MDX. Used for
  // analytics on how many of the 9 blocks the lesson actually exposes;
  // ≥5 of 9 is the acceptance bar from the vision document.
  blocks: z.array(LessonBlockId).optional(),
});

const CognitiveLevel = z.enum(["recall", "apply", "analyze"]);
const ScenarioType = z.enum([
  "factual",
  "map",
  "numeric",
  "decision",
  "regulatory",
]);

const QuestionYaml = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  stem: Multilingual,
  options: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9]+$/),
        text: Multilingual,
      }),
    )
    // 2 minimum during the 3 → 4 option migration; new questions must use 4.
    .min(2)
    .max(4),
  correctOptionId: z.string(),
  explanation: Multilingual,
  // Per-distractor rationale, keyed by optionId. Authoring rule (validated
  // below in importQuestions): every wrong option should have an entry, and
  // the correctOptionId must NOT appear here.
  distractorRationales: z.record(z.string(), Multilingual).optional(),
  sourceRef: z.string().min(1),
  internalRef: z.string().min(1).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  cognitiveLevel: CognitiveLevel.optional(),
  scenarioType: ScenarioType.optional(),
  lessonSectionRef: z
    .string()
    .regex(/^[a-z0-9-]+\/[a-z0-9-]+(#[a-z0-9-]+)?$/)
    .optional(),
  // Optional file name (without path) of a PNG/JPG/SVG in
  // public/questions/<topic-slug>/. Loader rewrites it to a public URL.
  image: z
    .string()
    .regex(/^[a-z0-9_-]+\.(png|jpg|jpeg|svg|webp)$/i)
    .optional(),
  imageAlt: Multilingual.optional(),
});

const QuestionsYaml = z.array(QuestionYaml);

// ── Helpers ───────────────────────────────────────────────────────────────

type Counts = { created: number; updated: number };

function emptyCounts(): Counts {
  return { created: 0, updated: 0 };
}

function readYaml<T>(path: string, schema: z.ZodType<T>): T {
  const raw = readFileSync(path, "utf-8");
  const parsed = parseYaml(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Validation failed for ${path}:\n${issues}`);
  }
  return result.data;
}

function readMdxLocales(lessonDir: string, locales: string[]): Record<string, string> {
  const body: Record<string, string> = {};
  for (const locale of locales) {
    const file = join(lessonDir, `${locale}.mdx`);
    if (!existsSync(file)) {
      throw new Error(
        `Lesson ${lessonDir} declares title.${locale} in meta.yml but ${locale}.mdx is missing`,
      );
    }
    body[locale] = readFileSync(file, "utf-8");
  }
  return body;
}

function listDirs(parent: string): string[] {
  if (!existsSync(parent)) return [];
  return readdirSync(parent).filter((entry) =>
    statSync(join(parent, entry)).isDirectory(),
  );
}

function listFiles(parent: string, ext: string): string[] {
  if (!existsSync(parent)) return [];
  return readdirSync(parent).filter((f) => f.endsWith(ext));
}

// ── Importers ─────────────────────────────────────────────────────────────

async function importTopics(prisma: PrismaClient): Promise<Map<string, string>> {
  const counts = emptyCounts();
  const slugToId = new Map<string, string>();
  const topicsDir = join(CONTENT_DIR, "topics");
  const files = listFiles(topicsDir, ".yml");

  for (const file of files) {
    const data = readYaml(join(topicsDir, file), TopicYaml);
    const existing = await prisma.topic.findUnique({ where: { slug: data.slug } });
    const row = await prisma.topic.upsert({
      where: { slug: data.slug },
      create: {
        slug: data.slug,
        ord: data.ord,
        title: data.title as Prisma.InputJsonValue,
        summary: data.summary as Prisma.InputJsonValue,
      },
      update: {
        ord: data.ord,
        title: data.title as Prisma.InputJsonValue,
        summary: data.summary as Prisma.InputJsonValue,
      },
    });
    slugToId.set(data.slug, row.id);
    if (existing) counts.updated++;
    else counts.created++;
  }

  console.log(
    `topics:    ${files.length} total · ${counts.created} created · ${counts.updated} updated`,
  );
  return slugToId;
}

async function importLessons(
  prisma: PrismaClient,
  topicSlugToId: Map<string, string>,
): Promise<void> {
  const counts = emptyCounts();
  let total = 0;
  const lessonsRoot = join(CONTENT_DIR, "lessons");

  for (const topicSlug of listDirs(lessonsRoot)) {
    const topicId = topicSlugToId.get(topicSlug);
    if (!topicId) {
      throw new Error(
        `content/lessons/${topicSlug}/ has no matching content/topics/${topicSlug}.yml`,
      );
    }

    const topicDir = join(lessonsRoot, topicSlug);
    for (const lessonSlug of listDirs(topicDir)) {
      const lessonDir = join(topicDir, lessonSlug);
      const meta = readYaml(join(lessonDir, "meta.yml"), LessonMetaYaml);
      if (meta.slug !== lessonSlug) {
        throw new Error(
          `Lesson dir name "${lessonSlug}" does not match meta.yml slug "${meta.slug}" at ${lessonDir}`,
        );
      }
      const titleLocales = Object.keys(meta.title);
      const bodyMdx = readMdxLocales(lessonDir, titleLocales);

      const existing = await prisma.lesson.findUnique({
        where: { topicId_slug: { topicId, slug: meta.slug } },
      });
      const blocks = meta.blocks
        ? (meta.blocks as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull;
      await prisma.lesson.upsert({
        where: { topicId_slug: { topicId, slug: meta.slug } },
        create: {
          topicId,
          slug: meta.slug,
          ord: meta.ord,
          title: meta.title as Prisma.InputJsonValue,
          bodyMdx: bodyMdx as Prisma.InputJsonValue,
          sourceRef: meta.sourceRef ?? null,
          blocks,
        },
        update: {
          ord: meta.ord,
          title: meta.title as Prisma.InputJsonValue,
          bodyMdx: bodyMdx as Prisma.InputJsonValue,
          sourceRef: meta.sourceRef ?? null,
          blocks,
        },
      });
      total++;
      if (existing) counts.updated++;
      else counts.created++;
    }
  }

  console.log(
    `lessons:   ${total} total · ${counts.created} created · ${counts.updated} updated`,
  );
}

async function importQuestions(
  prisma: PrismaClient,
  topicSlugToId: Map<string, string>,
): Promise<void> {
  const counts = emptyCounts();
  let total = 0;
  const questionsDir = join(CONTENT_DIR, "questions");
  const files = listFiles(questionsDir, ".yml");

  for (const file of files) {
    const topicSlug = file.replace(/\.yml$/, "");
    const topicId = topicSlugToId.get(topicSlug);
    if (!topicId) {
      throw new Error(
        `content/questions/${file} has no matching content/topics/${topicSlug}.yml`,
      );
    }

    const questions = readYaml(join(questionsDir, file), QuestionsYaml);
    for (const q of questions) {
      const optionIds = q.options.map((o) => o.id);
      if (!optionIds.includes(q.correctOptionId)) {
        throw new Error(
          `Question ${q.id} in ${file}: correctOptionId "${q.correctOptionId}" is not in options [${optionIds.join(", ")}]`,
        );
      }
      if (q.distractorRationales) {
        for (const key of Object.keys(q.distractorRationales)) {
          if (!optionIds.includes(key)) {
            throw new Error(
              `Question ${q.id} in ${file}: distractorRationales has unknown optionId "${key}"`,
            );
          }
          if (key === q.correctOptionId) {
            throw new Error(
              `Question ${q.id} in ${file}: distractorRationales must not include the correct option "${key}"`,
            );
          }
        }
      }

      const distractorRationales = q.distractorRationales
        ? (q.distractorRationales as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull;

      let imageUrl: string | null = null;
      let imageAlt: Prisma.InputJsonValue | typeof Prisma.JsonNull =
        Prisma.JsonNull;
      if (q.image) {
        if (!q.imageAlt) {
          throw new Error(
            `Question ${q.id} in ${file}: imageAlt is required when image is set`,
          );
        }
        const imagePath = join(
          process.cwd(),
          "public",
          "questions",
          topicSlug,
          q.image,
        );
        if (!existsSync(imagePath)) {
          throw new Error(
            `Question ${q.id} in ${file}: image file not found at public/questions/${topicSlug}/${q.image}`,
          );
        }
        imageUrl = `/questions/${topicSlug}/${q.image}`;
        imageAlt = q.imageAlt as unknown as Prisma.InputJsonValue;
      } else if (q.imageAlt) {
        throw new Error(
          `Question ${q.id} in ${file}: imageAlt set without an image — remove it`,
        );
      }

      const existing = await prisma.question.findUnique({
        where: { externalId: q.id },
      });
      await prisma.question.upsert({
        where: { externalId: q.id },
        create: {
          externalId: q.id,
          topicId,
          stem: q.stem as Prisma.InputJsonValue,
          options: q.options as unknown as Prisma.InputJsonValue,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation as Prisma.InputJsonValue,
          distractorRationales,
          sourceRef: q.sourceRef,
          difficulty: q.difficulty ?? null,
          cognitiveLevel: q.cognitiveLevel ?? null,
          scenarioType: q.scenarioType ?? null,
          lessonSectionRef: q.lessonSectionRef ?? null,
          imageUrl,
          imageAlt,
        },
        update: {
          topicId,
          stem: q.stem as Prisma.InputJsonValue,
          options: q.options as unknown as Prisma.InputJsonValue,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation as Prisma.InputJsonValue,
          distractorRationales,
          sourceRef: q.sourceRef,
          difficulty: q.difficulty ?? null,
          cognitiveLevel: q.cognitiveLevel ?? null,
          scenarioType: q.scenarioType ?? null,
          lessonSectionRef: q.lessonSectionRef ?? null,
          imageUrl,
          imageAlt,
        },
      });
      total++;
      if (existing) counts.updated++;
      else counts.created++;
    }
  }

  console.log(
    `questions: ${total} total · ${counts.created} created · ${counts.updated} updated`,
  );
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(CONTENT_DIR)) {
    throw new Error(`content/ directory not found at ${CONTENT_DIR}`);
  }
  const prisma = new PrismaClient();
  try {
    const topicSlugToId = await importTopics(prisma);
    await importLessons(prisma, topicSlugToId);
    await importQuestions(prisma, topicSlugToId);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
