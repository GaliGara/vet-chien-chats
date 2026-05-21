import { AppointmentForm } from "@/components/forms/appointment-form";
import { AnimatedSection } from "@/components/landing/animated-section";
import { SectionHeading } from "@/components/landing/section-heading";

export function AppointmentSection() {
  return (
    <AnimatedSection id="citas" className="bg-[#F7F1FA] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <SectionHeading
            eyebrow="Citas"
            title="Reserva sin friccion, confirma con calma."
            description="El formulario inserta solicitudes en Supabase usando el cliente publico. Cada cita entra como nueva para que puedas gestionarla desde admin."
          />
          <div className="mt-8 rounded-[1.75rem] border border-[#E8D6DE] bg-white/70 p-5 text-sm leading-7 text-[#7B6A80]">
            Responderemos por tu canal preferido. Tambien puedes continuar por
            WhatsApp con un mensaje prellenado para cerrar detalles al momento.
          </div>
        </div>
        <AppointmentForm />
      </div>
    </AnimatedSection>
  );
}
