import { Quote } from "lucide-react";
import { testimonials } from "@/constants/site";
import { AnimatedSection, MotionCard } from "@/components/landing/animated-section";
import { SectionHeading } from "@/components/landing/section-heading";

export function TestimonialsSection() {
  return (
    <AnimatedSection
      id="testimonios"
      className="bg-[#2F2433] px-4 py-20 text-[#FFFDFB] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          light
          center
          eyebrow="Testimonios"
          title="Confianza que se siente en cada detalle."
          description="Una experiencia premium no es distancia: es cuidado, claridad y seguimiento oportuno."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <MotionCard key={testimonial.name}>
              <article className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
                <Quote className="mb-8 size-8 text-[#F7C8D9]" />
                <p className="text-base leading-8 text-[#FFFDFB]">
                  “{testimonial.quote}”
                </p>
                <div className="mt-8 border-t border-white/10 pt-5">
                  <p className="font-heading text-xl text-white">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 text-sm text-[#D9C6E8]">
                    {testimonial.role}
                  </p>
                </div>
              </article>
            </MotionCard>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
