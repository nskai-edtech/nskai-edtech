import FeaturesSection from "@/components/landing-page/features";
import HeroSection from "@/components/landing-page/hero-section";
import Navbar from "@/components/landing-page/navbar";
import TestimonialsSection from "@/components/landing-page/testimonials";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="px-4 py-2 max-w-7xl mx-auto">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
    </div>
  );
}
