import { AdoptionsSection } from "@/components/landing/adoptions-section";
import { AppointmentSection } from "@/components/landing/appointment-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { ProcessSection } from "@/components/landing/process-section";
import { ServicesSection } from "@/components/landing/services-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      <Navbar />
      <main>
        <Hero />
        <ServicesSection />
        <ProcessSection />
        <AdoptionsSection />
        <TestimonialsSection />
        <AppointmentSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
