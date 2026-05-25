"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Cat,
  Heart,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { brand, veterinaryMicrocopy } from "@/constants/site";
import { Button } from "@/components/ui/button";

const whiteSchnauzerPhoto =
  "https://images.unsplash.com/photo-1573084450251-e8357a1efb17?auto=format&fit=crop&crop=faces&fm=jpg&q=86&w=1400&h=1400";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="inicio"
      className="relative isolate overflow-x-clip bg-[linear-gradient(135deg,#FFFDFB_0%,#FFF6F8_50%,#F7F1FA_100%)]"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,#FFFDFB_0%,rgba(255,253,251,0)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,rgba(232,214,222,0),#E8D6DE,rgba(232,214,222,0))]" />

      <div className="mx-auto grid min-h-[calc(84svh-4rem)] w-full max-w-7xl items-center gap-8 px-4 py-8 min-[390px]:px-5 sm:px-6 md:py-12 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0.98, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative z-10 w-full max-w-[22rem] lg:max-w-none"
        >
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[#E8D6DE] bg-white/75 px-4 py-2 text-sm font-medium text-[#5B3A63] shadow-sm backdrop-blur">
            <Sparkles className="size-4 text-[#C89B8C]" />
            <span className="truncate">Cuidado boutique para perros y gatos</span>
          </div>

          <h1 className="max-w-full font-heading text-[2.6rem] leading-[1.04] text-[#2F2433] min-[390px]:text-5xl sm:max-w-4xl sm:text-6xl lg:text-7xl">
            Una experiencia cálida para cuidar, reservar y adoptar con amor.
          </h1>
          <p className="mt-6 max-w-full text-lg leading-8 text-[#7B6A80] sm:max-w-2xl sm:text-xl">
            En {brand.name} acompañamos el bienestar de perros y gatos con atención
            médica, estética, procesos de adopción y una experiencia clara, humana
            y refinada.
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

          <div className="mt-8 grid max-w-full grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-3">
            {veterinaryMicrocopy.map((label, index) => (
              <motion.div
                key={label}
                initial={shouldReduceMotion ? false : { opacity: 0.98, y: 8 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.45,
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-3xl border border-[#E8D6DE] bg-white/74 p-4 shadow-sm backdrop-blur"
              >
                <p className="font-heading text-2xl text-[#A7353F]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-medium leading-6 text-[#7B6A80]">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={
            shouldReduceMotion ? false : { opacity: 0.98, y: 12, scale: 0.99 }
          }
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 0.8, delay: 0.06, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative mx-auto w-full max-w-[22rem] sm:max-w-[520px] lg:max-w-[560px]"
        >
          <div className="relative mx-auto h-[15rem] w-full sm:hidden">
            <motion.div
              className="absolute inset-x-2 top-0 rounded-[1.6rem] border border-white/80 bg-white/92 p-3.5 shadow-[0_16px_34px_rgb(91_58_99/0.09)] backdrop-blur"
              animate={shouldReduceMotion ? undefined : { y: [0, -2, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <div className="grid grid-cols-[5rem_1fr] items-center gap-3">
                <Image
                  src={whiteSchnauzerPhoto}
                  alt="Schnauzer blanco en consulta veterinaria"
                  width={160}
                  height={160}
                  priority
                  className="size-20 rounded-[1.1rem] border border-[#E8D6DE] object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-heading text-[2.15rem] leading-none text-[#2F2433]">
                    Cuidado
                  </p>
                  <p className="mt-1 text-base font-medium text-[#7B6A80]">
                    médico y estético
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="absolute inset-x-3 bottom-[3.2rem] grid grid-cols-2 gap-2">
              <div className="rounded-[1.05rem] border border-[#E8D6DE] bg-[#FFFDFB]/95 px-3 py-2.5 text-center shadow-[0_10px_22px_rgb(91_58_99/0.07)]">
                <PawPrint className="mx-auto mb-1 size-4 text-[#5B3A63]" />
                <p className="text-[1.02rem] font-semibold text-[#5B3A63]">Perros</p>
              </div>
              <div className="rounded-[1.05rem] border border-[#E8D6DE] bg-[#FFFDFB]/95 px-3 py-2.5 text-center shadow-[0_10px_22px_rgb(91_58_99/0.07)]">
                <Cat className="mx-auto mb-1 size-4 text-[#A7353F]" />
                <p className="text-[1.02rem] font-semibold text-[#5B3A63]">Gatos</p>
              </div>
            </div>

            <div className="absolute inset-x-6 bottom-0 rounded-full border border-white/80 bg-white/92 px-4 py-2.5 shadow-[0_12px_28px_rgb(91_58_99/0.08)] backdrop-blur">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#5B3A63]">
                <Heart className="size-4 fill-[#F7C8D9] text-[#A7353F]" />
                Reserva, cuidado y adopción
              </div>
            </div>
          </div>

          <div className="relative hidden h-[36rem] overflow-hidden rounded-[2.25rem] border border-[#E8D6DE] bg-[linear-gradient(150deg,#F7F1FA_0%,#FFFDFB_45%,#FFF6F8_100%)] premium-shadow sm:block">
            <div className="absolute inset-6 rounded-[1.75rem] border border-white/90 bg-white/72" />

            <motion.div
              className="absolute inset-x-8 top-8 h-[72%] overflow-hidden rounded-[1.8rem] border border-[#E8D6DE] shadow-[0_24px_52px_rgb(91_58_99/0.14)]"
              animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <Image
                src={whiteSchnauzerPhoto}
                alt="Schnauzer blanco en consulta veterinaria"
                fill
                sizes="(max-width: 1024px) 50vw, 520px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,36,51,0.02)_0%,rgba(47,36,51,0.28)_100%)]" />
            </motion.div>

            <div className="absolute left-10 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-[#E8D6DE] bg-white px-4 py-2 text-sm font-semibold text-[#5B3A63] shadow-md">
              <CalendarDays className="size-4 text-[#A7353F]" />
              Agenda ordenada
            </div>
            <div className="absolute right-10 top-[5.2rem] z-10 inline-flex items-center gap-2 rounded-full border border-[#E8D6DE] bg-white px-4 py-2 text-sm font-semibold text-[#5B3A63] shadow-md">
              <ShieldCheck className="size-4 text-[#5B3A63]" />
              Proceso claro
            </div>

            <div className="absolute left-11 top-[58%] z-10 rounded-[1.2rem] border border-[#E8D6DE] bg-white px-4 py-3 shadow-lg">
              <Stethoscope className="size-5 text-[#A7353F]" />
              <p className="mt-1.5 font-heading text-[1.9rem] leading-none text-[#2F2433]">
                Consulta
              </p>
              <p className="mt-1 text-sm text-[#7B6A80]">médica veterinaria</p>
            </div>
            <div className="absolute right-11 top-[61%] z-10 inline-flex items-center gap-2 rounded-full border border-[#E8D6DE] bg-white px-4 py-2 text-sm font-semibold text-[#5B3A63] shadow-md">
              <PawPrint className="size-4 text-[#A7353F]" />
              Adopción responsable
            </div>

            <div className="absolute inset-x-8 bottom-8 rounded-[1.3rem] border border-[#E8D6DE] bg-white px-4 py-3 shadow-[0_18px_36px_rgb(91_58_99/0.10)]">
              <div className="flex items-center gap-2 text-[#5B3A63]">
                <Sparkles className="size-4 text-[#C89B8C]" />
                <p className="text-base font-semibold">Bienestar integral para perros y gatos</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
