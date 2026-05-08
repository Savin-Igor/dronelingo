import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { readStaticPage } from "@/lib/static-page";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const body = readStaticPage("privacy", locale);
  if (!body) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <article className="prose prose-gray max-w-none">
        <MDXRemote source={body} />
      </article>
    </main>
  );
}
