import Link from "next/link";
import { ArrowRight, Heart, MapPinned, Navigation } from "lucide-react";
import { brand } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/landing/animated-section";

const mapsUrl = "https://maps.app.goo.gl/ipEHyogqQQoTbZ178";

export function FinalCta() {
  return (
    <AnimatedSection className="bg-[#FFFDFB] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-[#E8D6DE] bg-[linear-gradient(135deg,#FFF6F8,#F7F1FA)] p-8 text-center shadow-[0_24px_70px_rgb(91_58_99/0.12)] sm:p-12">
        <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-white text-[#A7353F] shadow-sm">
          <Heart className="size-7 fill-[#F7C8D9]" />
        </span>
        <h2 className="font-heading text-4xl leading-tight text-[#2F2433] sm:text-5xl">
          Empecemos con una experiencia clara, sensible y muy cuidada.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#7B6A80] sm:text-lg">
          Reserva en {brand.name} o explora adopciones disponibles. El
          siguiente paso puede sentirse sencillo, sereno y acompañado.
        </p>
        <Button
          asChild
          className="mt-8 h-12 rounded-full bg-[#A7353F] px-7 text-base text-[#FFFDFB] hover:bg-[#8E2D36]"
        >
          <Link href="/#citas">
            Reservar cita
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <div className="mt-8 grid gap-4 text-left sm:mt-10 md:grid-cols-2">
          <div className="rounded-[1.4rem] border border-[#E8D6DE] bg-white/80 p-4 shadow-sm">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E8D6DE] bg-[#FFF6F8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#A7353F]">
              <MapPinned className="size-3.5" />
              Ubicación
            </p>
            <p className="mt-3 text-sm leading-6 text-[#7B6A80]">
              Encuéntranos en Google Maps y llega fácilmente a la veterinaria.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 h-11 w-full rounded-full border-[#D9C6E8] bg-[#F7F1FA] text-[#5B3A63] hover:bg-[#EFE4F7]"
            >
              <a href={mapsUrl} target="_blank" rel="noreferrer">
                <Navigation className="size-4" />
                Cómo llegar
              </a>
            </Button>
          </div>

          <div className="overflow-hidden rounded-[1.4rem] border border-[#E8D6DE] bg-white/80 shadow-sm">
            <iframe
              title="Ubicación de Chiens et Chats en Google Maps"
              src="https://www.google.com/maps?q=Chiens%20et%20Chats&output=embed"
              className="h-52 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
