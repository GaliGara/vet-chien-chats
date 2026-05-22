"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Cat, Dog, Heart, PawPrint } from "lucide-react";
import { petStatusLabels } from "@/constants/site";
import type { PetForAdoption } from "@/types/database";
import { getPetsForAdoption } from "@/lib/supabase-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AnimatedSection,
  MotionCard,
  StaggerContainer,
  StaggerItem,
} from "@/components/landing/animated-section";
import { SectionHeading } from "@/components/landing/section-heading";

export function AdoptionsSection({ fullPage = false }: { fullPage?: boolean }) {
  const [pets, setPets] = useState<PetForAdoption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getPetsForAdoption(fullPage ? undefined : "disponible")
      .then((data) => {
        if (isMounted) setPets(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fullPage]);

  return (
    <AnimatedSection
      id="adopciones"
      className="bg-[#FFFDFB] px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Adopciones"
            title="Historias que esperan un hogar."
            description="Conoce perros y gatos disponibles para adopción responsable. Te acompañamos para que cada adopción sea segura y amorosa."
          />
          {!fullPage ? (
            <Button
              asChild
              variant="outline"
              className="h-11 w-fit rounded-full border-[#E8D6DE] bg-white px-5 text-[#5B3A63] hover:bg-[#FFF6F8]"
            >
              <Link href="/adopciones">
                Ver todas
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[390px] animate-pulse rounded-[1.75rem] bg-[#FFF6F8]"
              />
            ))}
          </div>
        ) : pets.length > 0 ? (
          <StaggerContainer className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(fullPage ? pets : pets.slice(0, 3)).map((pet) => (
              <StaggerItem key={pet.id}>
                <PetCard pet={pet} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-dashed border-[#D9C6E8] bg-[#F7F1FA]/70 p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-[#A7353F]">
              <PawPrint className="size-7" />
            </span>
            <h3 className="mt-5 font-heading text-3xl text-[#2F2433]">
              Aún no hay historias publicadas
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#7B6A80]">
              Cuando agregues perros o gatos disponibles en Supabase, se
              mostrarán aquí con una ficha clara, emocional y confiable.
            </p>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

export function PetCard({ pet }: { pet: PetForAdoption }) {
  return (
    <MotionCard>
      <article className="h-full overflow-hidden rounded-[1.75rem] border border-[#E8D6DE] bg-white shadow-[0_18px_50px_rgb(91_58_99/0.09)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F1FA]">
          <PetMedia pet={pet} />
          <div className="absolute left-4 top-4">
            <Badge className="rounded-full bg-white/88 px-3 py-1 text-[#5B3A63] shadow-sm backdrop-blur">
              {petStatusLabels[pet.status] ?? pet.status}
            </Badge>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-heading text-3xl text-[#2F2433]">
                {pet.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#A7353F]">
                {pet.species}
                {pet.breed ? ` · ${pet.breed}` : ""}
              </p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FFF6F8] text-[#A7353F]">
              <Heart className="size-5" />
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#7B6A80]">
            {pet.age ? (
              <span className="rounded-full bg-[#F7F1FA] px-3 py-1">
                {pet.age}
              </span>
            ) : null}
            {pet.sex ? (
              <span className="rounded-full bg-[#F7F1FA] px-3 py-1">
                {pet.sex}
              </span>
            ) : null}
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#7B6A80]">
            {pet.description ??
              "Perfil en preparación con acompañamiento para encontrar la familia ideal."}
          </p>
        </div>
      </article>
    </MotionCard>
  );
}

function PetMedia({ pet }: { pet: PetForAdoption }) {
  const [hasImage, setHasImage] = useState(Boolean(pet.image_url));

  if (hasImage && pet.image_url) {
    return (
      <img
        src={pet.image_url}
        alt={`Foto de ${pet.name}`}
        onError={() => setHasImage(false)}
        className="h-full w-full object-cover"
      />
    );
  }

  const Icon = pet.species.toLowerCase().includes("gato") ? Cat : Dog;

  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#F7F1FA_0%,#FFFDFB_52%,#FFF6F8_100%)]">
      <div className="rounded-[2rem] border border-white/80 bg-white/55 p-6 text-center shadow-xl backdrop-blur">
        <Icon className="mx-auto size-12 text-[#A7353F]" />
        <p className="mt-4 font-heading text-2xl text-[#2F2433]">{pet.name}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7B6A80]">
          Chiens et Chats
        </p>
      </div>
    </div>
  );
}
