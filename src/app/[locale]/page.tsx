import { DailyWarmUp } from "@/components/landing/DailyWarmUp";
import { ExamFacts } from "@/components/landing/ExamFacts";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StructuredData } from "@/components/landing/StructuredData";
import { ValueProp } from "@/components/landing/ValueProp";
import { WhyDronelingo } from "@/components/landing/WhyDronelingo";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main>
      <StructuredData locale={locale} />
      <Hero />
      <DailyWarmUp />
      <ValueProp />
      <HowItWorks />
      <WhyDronelingo />
      <ExamFacts />
    </main>
  );
}
