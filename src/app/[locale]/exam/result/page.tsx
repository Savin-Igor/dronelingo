import { ExamResultView } from "@/components/exam/ExamResultView";

export const dynamic = "force-dynamic";

export default function ExamResultPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <ExamResultView />
    </main>
  );
}
