import { CheckCircle2, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { AnimatedSection } from "@/components/landing/animated-section";
import { SectionHeading } from "@/components/landing/section-heading";

export function AppointmentSection() {
  return (
    <AnimatedSection
      id="citas"
      className="bg-[#F7F1FA] px-4 py-18 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <SectionHeading
            eyebrow="Citas"
            title="Reserva sin fricción, confirma con calma."
            description="Agenda consulta, baño, corte, vacunación, desparasitación o seguimiento de adopción. Te respondemos con claridad y trato cercano."
          />
          <div className="mt-8 grid gap-3">
            {[
              {
                icon: CheckCircle2,
                text: "Elige el servicio, fecha y horario que mejor funcionen para ti.",
              },
              {
                icon: MessageCircleHeart,
                text: "WhatsApp queda listo con el resumen para continuar la conversación.",
              },
              {
                icon: ShieldCheck,
                text: "Tu solicitud entra como nueva para recibir confirmación humana.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="flex items-start gap-3 rounded-[1.4rem] border border-[#E8D6DE] bg-white/70 p-4 text-sm leading-6 text-[#7B6A80] backdrop-blur"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-[#A7353F]" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
        <AppointmentForm />
      </div>
    </AnimatedSection>
  );
}
