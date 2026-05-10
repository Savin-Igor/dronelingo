import { ExamSession } from "@/components/exam/ExamSession";
import { buildStratifiedExam } from "@/lib/exam";

export const dynamic = "force-dynamic";

export default async function ExamSessionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const questions = await buildStratifiedExam(locale);

  return (
    <main className="mx-auto max-w-3xl px-6 pb-12 pt-6">
      <ExamSession questions={questions} />
    </main>
  );
}
