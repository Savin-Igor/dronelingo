import { notFound } from "next/navigation";

import { AccessGate } from "@/components/access/AccessGate";
import { ExamSession } from "@/components/exam/ExamSession";
import {
  buildMeteorologyA2Exam,
  METEO_A2_DURATION_MIN,
  METEO_A2_PASS_THRESHOLD,
} from "@/lib/exam";

export const dynamic = "force-dynamic";

export default async function MeteorologyA2ExamSessionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const built = await buildMeteorologyA2Exam(locale);
  if (!built) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-12 pt-6">
      <AccessGate>
        <ExamSession
          questions={built.questions}
          durationMin={METEO_A2_DURATION_MIN}
          passThreshold={METEO_A2_PASS_THRESHOLD}
          examType="meteorology-a2"
        />
      </AccessGate>
    </main>
  );
}
