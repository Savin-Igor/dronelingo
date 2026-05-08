import { ExamFacts } from "@/components/landing/ExamFacts";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ValueProp } from "@/components/landing/ValueProp";
import { WhyDronelingo } from "@/components/landing/WhyDronelingo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Hero />
      <ValueProp />
      <HowItWorks />
      <WhyDronelingo />
      <ExamFacts />
      <Footer />
    </main>
  );
}
