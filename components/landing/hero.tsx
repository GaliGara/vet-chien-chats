"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { heroImage } from "@/constants/site";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#FFFDFB_0%,#FFF6F8_50%,#F7F1FA_100%)]"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,#FFFDFB_0%,rgba(255,253,251,0)_100%)]" />
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8D6DE] bg-white/70 px-4 py-2 text-sm font-medium text-[#5B3A63] shadow-sm">
            <Sparkles className="size-4 text-[#C89B8C]" />
            Cuidado boutique para familias y mascotas
          </div>
          <h1 className="font-heading text-5xl leading-[0.98] text-[#2F2433] sm:text-6xl lg:text-7xl">
            Una experiencia cálida para reservar, adoptar y conectar con amor.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#7B6A80] sm:text-xl">
            Agenda tu cita, conoce el proceso de adopción y recibe
            acompañamiento en cada paso con una experiencia clara, humana y
            refinada.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-13 rounded-full bg-[#A7353F] px-7 text-base text-[#FFFDFB] shadow-lg shadow-[#A7353F]/20 hover:bg-[#8E2D36]"
            >
              <Link href="/#citas">
                Reservar cita
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-13 rounded-full border-[#E8D6DE] bg-white/75 px-7 text-base text-[#5B3A63] hover:bg-[#FFF6F8]"
            >
              <Link href="/#adopciones">Conocer adopciones</Link>
            </Button>
          </div>
          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["24h", "respuesta amable"],
              ["100%", "mobile-first"],
              ["4 pasos", "proceso claro"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-[#E8D6DE] bg-white/72 p-4 text-center shadow-sm"
              >
                <p className="font-heading text-2xl text-[#A7353F]">{value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#7B6A80]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] border border-white/80 bg-white premium-shadow">
            <img
              src={heroImage}
              alt="Persona abrazando a una mascota en una experiencia de cuidado"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,36,51,0)_35%,rgba(47,36,51,0.55)_100%)]" />
            <div className="absolute inset-x-5 bottom-5 rounded-[1.7rem] border border-white/35 bg-white/86 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FFF6F8] text-[#A7353F]">
                  <Heart className="size-5 fill-[#F7C8D9]" />
                </span>
                <div>
                  <p className="font-heading text-xl text-[#2F2433]">
                    Acompañamiento sensible
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#7B6A80]">
                    Citas y adopciones guiadas con claridad, confianza y
                    detalles que se sienten humanos.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -left-2 top-8 hidden rounded-3xl border border-[#E8D6DE] bg-[#FFFDFB] p-4 shadow-xl sm:block">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-[#A7353F]" />
              <div>
                <p className="text-sm font-semibold text-[#2F2433]">
                  Citas ordenadas
                </p>
                <p className="text-xs text-[#7B6A80]">sin llamadas eternas</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-2 top-24 hidden rounded-3xl border border-[#E8D6DE] bg-[#FFFDFB] p-4 shadow-xl sm:block">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-[#5B3A63]" />
              <div>
                <p className="text-sm font-semibold text-[#2F2433]">
                  Proceso claro
                </p>
                <p className="text-xs text-[#7B6A80]">paso a paso</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
