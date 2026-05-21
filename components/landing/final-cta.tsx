import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/landing/animated-section";

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
          Reserva una cita o explora adopciones disponibles. El siguiente paso
          puede sentirse sencillo, sereno y acompañado.
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
      </div>
    </AnimatedSection>
  );
}
