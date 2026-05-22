"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Cat,
  Dog,
  Heart,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { brand, veterinaryMicrocopy } from "@/constants/site";
import { Button } from "@/components/ui/button";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="inicio"
      className="relative isolate overflow-x-clip bg-[linear-gradient(135deg,#FFFDFB_0%,#FFF6F8_50%,#F7F1FA_100%)]"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,#FFFDFB_0%,rgba(255,253,251,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,rgba(232,214,222,0),#E8D6DE,rgba(232,214,222,0))]" />
      <div className="mx-auto grid min-h-[calc(86svh-4rem)] w-full max-w-7xl items-center justify-items-center gap-9 px-4 py-9 min-[390px]:px-5 sm:px-6 md:py-12 lg:grid-cols-[1.02fr_0.98fr] lg:justify-items-stretch lg:px-8 lg:py-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0.98, y: 18 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative z-10 w-full max-w-[22rem] lg:max-w-none"
        >
          <div className="mx-auto mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[#E8D6DE] bg-white/70 px-4 py-2 text-sm font-medium text-[#5B3A63] shadow-sm backdrop-blur lg:mx-0">
            <Sparkles className="size-4 text-[#C89B8C]" />
            <span className="truncate">
              Cuidado boutique para perros y gatos
            </span>
          </div>
          <h1 className="max-w-full font-heading text-[2.8rem] leading-[1.03] text-[#2F2433] min-[390px]:text-5xl sm:max-w-4xl sm:text-6xl lg:text-7xl">
            Una experiencia cálida para cuidar, reservar y adoptar con amor.
          </h1>
          <p className="mt-6 max-w-full text-lg leading-8 text-[#7B6A80] sm:max-w-2xl sm:text-xl">
            En {brand.name} acompañamos el bienestar de perros y gatos con
            atención médica, estética, procesos de adopción y una experiencia
            clara, humana y refinada.
          </p>
          <div className="mt-8 flex max-w-full flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
            <Button
              asChild
              className="h-13 w-full rounded-full bg-[#A7353F] px-7 text-base text-[#FFFDFB] shadow-lg shadow-[#A7353F]/20 hover:bg-[#8E2D36] focus-visible:ring-[#DFA2BA]/50 sm:w-auto"
            >
              <Link href="/#citas">
                Reservar cita
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-13 w-full rounded-full border-[#E8D6DE] bg-white/75 px-7 text-base text-[#5B3A63] hover:bg-[#FFF6F8] focus-visible:ring-[#DFA2BA]/50 sm:w-auto"
            >
              <Link href="/#adopciones">Ver adopciones</Link>
            </Button>
          </div>
          <div className="mt-9 grid max-w-full grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-3">
            {veterinaryMicrocopy.map((label, index) => (
              <div
                key={label}
                className="rounded-3xl border border-[#E8D6DE] bg-white/72 p-4 shadow-sm backdrop-blur"
              >
                <p className="font-heading text-2xl text-[#A7353F]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-medium leading-6 text-[#7B6A80]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={
            shouldReduceMotion ? false : { opacity: 0.98, y: 14, scale: 0.98 }
          }
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative mx-auto w-full max-w-[20.5rem] min-[390px]:max-w-[22rem] sm:max-w-[520px] lg:max-w-[560px] lg:justify-self-end"
        >
          <div className="relative mx-auto h-[15.5rem] w-full max-w-[20.5rem] sm:hidden">
            <motion.div
              className="absolute left-1/2 top-1 grid size-28 -translate-x-1/2 place-items-center rounded-full border border-white/80 bg-white/86 text-[#A7353F] shadow-[0_18px_42px_rgb(91_58_99/0.10)] backdrop-blur"
              animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <div className="text-center">
                <Stethoscope className="mx-auto size-8" />
                <p className="mt-2 font-heading text-xl text-[#2F2433]">
                  Cuidado
                </p>
              </div>
            </motion.div>
            <motion.div
              className="absolute left-2 top-24 rounded-[1.35rem] border border-[#E8D6DE] bg-[#FFFDFB]/90 px-4 py-3 shadow-[0_14px_34px_rgb(91_58_99/0.08)] backdrop-blur"
              animate={shouldReduceMotion ? undefined : { y: [0, 4, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 8.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Dog className="mb-1 size-6 text-[#5B3A63]" />
              <p className="text-sm font-semibold text-[#5B3A63]">Perros</p>
            </motion.div>
            <motion.div
              className="absolute right-2 top-24 rounded-[1.35rem] border border-[#E8D6DE] bg-[#FFFDFB]/90 px-4 py-3 shadow-[0_14px_34px_rgb(91_58_99/0.08)] backdrop-blur"
              animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Cat className="mb-1 size-6 text-[#A7353F]" />
              <p className="text-sm font-semibold text-[#5B3A63]">Gatos</p>
            </motion.div>
            <div className="absolute inset-x-5 bottom-2 rounded-full border border-white/80 bg-white/88 px-4 py-3 shadow-[0_14px_36px_rgb(91_58_99/0.08)] backdrop-blur">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#5B3A63]">
                <Heart className="size-4 fill-[#F7C8D9] text-[#A7353F]" />
                Reserva, cuidado y adopción
              </div>
            </div>
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2.25rem] border border-white/80 bg-[linear-gradient(145deg,#F7F1FA_0%,#FFFDFB_46%,#FFF6F8_100%)] premium-shadow sm:block">
            <div className="absolute inset-5 rounded-[1.85rem] border border-white/80 bg-white/35 backdrop-blur-sm" />
            <motion.div
              className="absolute left-8 top-10 rounded-[2rem] border border-[#E8D6DE] bg-white/80 p-5 shadow-xl backdrop-blur"
              animate={shouldReduceMotion ? undefined : { y: [0, -5, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 8.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Stethoscope className="size-9 text-[#A7353F]" />
              <p className="mt-4 font-heading text-2xl text-[#2F2433]">
                Consulta
              </p>
              <p className="mt-1 text-sm text-[#7B6A80]">médica veterinaria</p>
            </motion.div>
            <motion.div
              className="absolute right-7 top-28 grid size-24 place-items-center rounded-full border border-[#E8D6DE] bg-[#FFFDFB]/82 shadow-xl backdrop-blur"
              animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 9.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Dog className="size-10 text-[#5B3A63]" />
            </motion.div>
            <motion.div
              className="absolute bottom-36 left-9 grid size-20 place-items-center rounded-[1.7rem] border border-[#E8D6DE] bg-[#F7F1FA]/86 shadow-xl backdrop-blur"
              animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Cat className="size-9 text-[#A7353F]" />
            </motion.div>
            <div className="absolute right-10 bottom-32 flex items-center gap-2 rounded-full border border-[#E8D6DE] bg-white/82 px-4 py-2 text-sm font-semibold text-[#5B3A63] shadow-lg backdrop-blur">
              <PawPrint className="size-4 text-[#A7353F]" />
              Adopción responsable
            </div>
            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-[#E8D6DE] bg-white/58 px-5 py-4 text-center shadow-lg backdrop-blur-sm sm:block">
              <Sparkles className="mx-auto mb-2 size-5 text-[#C89B8C]" />
              <p className="font-heading text-xl text-[#2F2433]">
                Bienestar integral
              </p>
              <p className="mt-1 text-xs font-medium text-[#7B6A80]">
                perros y gatos
              </p>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-[1.7rem] border border-white/35 bg-white/88 p-4 shadow-2xl backdrop-blur-md sm:inset-x-5 sm:bottom-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FFF6F8] text-[#A7353F]">
                  <Heart className="size-5 fill-[#F7C8D9]" />
                </span>
                <div>
                  <p className="font-heading text-xl text-[#2F2433]">
                    Acompañamiento sensible
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#7B6A80]">
                    Cuidado médico, estético y adopciones guiadas con claridad,
                    confianza y detalles que se sienten humanos.
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
                  Agenda ordenada
                </p>
                <p className="text-xs text-[#7B6A80]">confirmación humana</p>
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
