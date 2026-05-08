import { Link } from "@/i18n/navigation";
import { localize } from "@/lib/localize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LearnIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const topics = await prisma.topic.findMany({ orderBy: { ord: "asc" } });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-gray-900">Learn</h1>
      <ul className="mt-8 space-y-4">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <Link href={`/learn/${topic.slug}`} className="block">
              <h2 className="text-xl font-semibold text-gray-900">
                {localize(topic.title, locale)}
              </h2>
              <p className="mt-2 text-gray-600">
                {localize(topic.summary, locale)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
