import { ClaimFlow } from "@/components/claim/ClaimFlow";

export const dynamic = "force-dynamic";

export default function ClaimPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <ClaimFlow />
    </main>
  );
}
