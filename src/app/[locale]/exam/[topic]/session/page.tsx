import { notFound } from "next/navigation";

import { AccessGate } from "@/components/access/AccessGate";
import { ExamSession } from "@/components/exam/ExamSession";
import {
  buildTopicExam,
  TOPIC_EXAM_SEC_PER_QUESTION,
} from "@/lib/exam";
import { isFreeTopic } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function TopicExamSessionPage({
  params,
}: {
  params: Promise<{ locale: string; topic: string }>;
}) {
  const { locale, topic: topicSlug } = await params;

  const built = await buildTopicExam(locale, topicSlug);
  if (!built) notFound();

  const durationMin = Math.max(
    1,
    Math.round(
      (built.questions.length * TOPIC_EXAM_SEC_PER_QUESTION) / 60,
    ),
  );

  const session = (
    <ExamSession
      questions={built.questions}
      durationMin={durationMin}
      examType="topic"
      topicSlug={built.topicSlug}
    />
  );

  return (
    <main className="mx-auto max-w-3xl px-6 pb-12 pt-6">
      {isFreeTopic(topicSlug) ? session : <AccessGate>{session}</AccessGate>}
    </main>
  );
}
