"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { testimonials } from "@/constants/site";
import { AnimatedSection } from "@/components/landing/animated-section";
import { SectionHeading } from "@/components/landing/section-heading";
import { Button } from "@/components/ui/button";

function getCardsPerView(width: number) {
  if (width >= 1200) return 3;
  if (width >= 768) return 2;
  return 1;
}

const pageThemes = [
  {
    card: "border-[#D9C6E8]/55 bg-[linear-gradient(160deg,rgba(91,58,99,0.58),rgba(47,36,51,0.72))]",
    divider: "border-white/16",
    quote: "text-[#FFD7E3]",
    stars: "text-[#FFD7E3]",
    role: "text-[#EBD6F7]",
  },
  {
    card: "border-[#C89B8C]/60 bg-[linear-gradient(160deg,rgba(105,64,76,0.60),rgba(73,44,58,0.74))]",
    divider: "border-[#F2DCD2]/30",
    quote: "text-[#FFD9C9]",
    stars: "text-[#FFD9C9]",
    role: "text-[#F1DBCF]",
  },
  {
    card: "border-[#A7353F]/60 bg-[linear-gradient(160deg,rgba(96,40,55,0.62),rgba(56,24,35,0.76))]",
    divider: "border-[#F3D3DD]/28",
    quote: "text-[#FFD5E2]",
    stars: "text-[#FFD5E2]",
    role: "text-[#F1D0DB]",
  },
] as const;

export function TestimonialsSection() {
  const shouldReduceMotion = useReducedMotion();
  const [cardsPerView, setCardsPerView] = useState(1);
  const [page, setPage] = useState(0);

  useEffect(() => {
    function updateCardsPerView() {
      setCardsPerView(getCardsPerView(window.innerWidth));
    }

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);

    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / cardsPerView));
  const activePage = page % totalPages;
  const activeTheme = pageThemes[activePage % pageThemes.length];

  useEffect(() => {
    if (shouldReduceMotion || totalPages <= 1) return;

    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % totalPages);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, totalPages]);

  const visibleTestimonials = useMemo(() => {
    const startIndex = activePage * cardsPerView;
    return Array.from({ length: cardsPerView }, (_, offset) => {
      const index = (startIndex + offset) % testimonials.length;
      return testimonials[index];
    });
  }, [activePage, cardsPerView]);

  function goNext() {
    setPage((current) => (current + 1) % totalPages);
  }

  function goPrev() {
    setPage((current) => (current - 1 + totalPages) % totalPages);
  }

  return (
    <AnimatedSection
      id="testimonios"
      className="relative overflow-hidden bg-[#2F2433] px-4 py-20 text-[#FFFDFB] sm:px-6 lg:px-8"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(217,198,232,0),rgba(217,198,232,0.45),rgba(217,198,232,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(215,162,186,0.14),transparent_44%),radial-gradient(circle_at_85%_80%,rgba(217,198,232,0.12),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          light
          center
          eyebrow="Testimonios"
          title="Confianza que se siente en cada detalle."
          description="Una experiencia premium no es distancia: es cuidado, claridad y seguimiento oportuno."
        />

        <div className="mt-10 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            aria-label="Ver testimonios anteriores"
            onClick={goPrev}
            className="h-10 w-10 rounded-full border-white/20 bg-white/10 p-0 text-white hover:bg-white/18"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Ver siguientes testimonios"
            onClick={goNext}
            className="h-10 w-10 rounded-full border-white/20 bg-white/10 p-0 text-white hover:bg-white/18"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="mt-5 min-h-[19.75rem] md:min-h-[20.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cardsPerView}-${activePage}`}
              initial={shouldReduceMotion ? false : { opacity: 0.98, y: 12 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0.98, y: -10 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
              }
              className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {visibleTestimonials.map((testimonial, index) => (
                <article
                  key={`${testimonial.name}-${index}-${activePage}`}
                  className={`flex h-[19.75rem] flex-col rounded-[1.75rem] p-5 shadow-[0_22px_70px_rgb(0_0_0/0.18)] backdrop-blur md:h-[20.5rem] ${activeTheme.card}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <Quote className={`size-8 ${activeTheme.quote}`} />
                    <span className={`inline-flex items-center gap-1 ${activeTheme.stars}`}>
                      {[0, 1, 2, 3, 4].map((star) => (
                        <Star
                          key={star}
                          className="size-3.5 fill-current"
                          strokeWidth={1.8}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="line-clamp-5 text-base leading-8 text-[#FFFDFB] md:line-clamp-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className={`mt-auto border-t pt-4 ${activeTheme.divider}`}>
                    <p className="font-heading text-xl text-white">
                      {testimonial.name}
                    </p>
                    <p className={`mt-1 text-sm ${activeTheme.role}`}>{testimonial.role}</p>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`Ir al grupo ${index + 1} de testimonios`}
              aria-current={activePage === index}
              className={`h-2.5 rounded-full transition ${
                activePage === index
                  ? "w-8 bg-[#F7C8D9]"
                  : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
