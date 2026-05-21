"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, HeartHandshake, PawPrint } from "lucide-react";
import { fallbackServices, serviceHighlights } from "@/constants/site";
import type { Service } from "@/types/database";
import { getServices } from "@/lib/supabase-queries";
import { AnimatedSection, MotionCard } from "@/components/landing/animated-section";
import { SectionHeading } from "@/components/landing/section-heading";

const serviceIcons = [CalendarDays, PawPrint, HeartHandshake];

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>(fallbackServices);

  useEffect(() => {
    let isMounted = true;

    getServices().then((data) => {
      if (isMounted && data.length > 0) {
        setServices(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AnimatedSection className="bg-[#FFFDFB] px-4 py-18 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <SectionHeading
            eyebrow="Servicios"
            title="Una experiencia pensada para cuidar cada detalle."
            description="Todo el flujo esta diseñado para que reservar, preguntar o iniciar una adopcion sea claro, calido y profesional."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {serviceHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[1.6rem] border border-[#E8D6DE] bg-[#FFF6F8] p-5 premium-ring"
                >
                  <Icon className="mb-4 size-6 text-[#A7353F]" />
                  <p className="font-heading text-xl text-[#2F2433]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#7B6A80]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.slice(0, 3).map((service, index) => {
            const Icon = serviceIcons[index % serviceIcons.length];
            return (
              <MotionCard key={service.id}>
                <article className="h-full rounded-[1.75rem] border border-[#E8D6DE] bg-white p-6 shadow-[0_18px_50px_rgb(91_58_99/0.08)] transition-colors hover:border-[#DFA2BA]">
                  <div className="mb-7 flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#F7F1FA] text-[#5B3A63]">
                      <Icon className="size-6" />
                    </span>
                    {service.duration_minutes ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6F8] px-3 py-1 text-xs font-semibold text-[#7B6A80]">
                        <Clock className="size-3" />
                        {service.duration_minutes} min
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-heading text-2xl text-[#2F2433]">
                    {service.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#7B6A80]">
                    {service.description ??
                      "Servicio preparado para una experiencia calida, clara y bien acompanada."}
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
