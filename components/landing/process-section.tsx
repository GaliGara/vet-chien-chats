import { processSteps } from "@/constants/site";
import { AnimatedSection, MotionCard } from "@/components/landing/animated-section";
import { SectionHeading } from "@/components/landing/section-heading";

export function ProcessSection() {
  return (
    <AnimatedSection
      id="proceso"
      className="bg-[#FFF6F8] px-4 py-18 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          center
          eyebrow="Proceso"
          title="Cuatro pasos simples para avanzar con confianza."
          description="La experiencia esta creada para que sepas que sigue, quien te acompana y como continuar en cada momento."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <MotionCard key={step.title}>
                <article className="relative h-full rounded-[1.75rem] border border-[#E8D6DE] bg-white p-6 shadow-[0_16px_42px_rgb(91_58_99/0.08)]">
                  <span className="absolute right-5 top-5 font-heading text-5xl text-[#F7C8D9]/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mb-8 grid size-12 place-items-center rounded-2xl bg-[#F7F1FA] text-[#5B3A63]">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="font-heading text-2xl text-[#2F2433]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#7B6A80]">
                    {step.description}
                  </p>
                </article>
              </MotionCard>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
