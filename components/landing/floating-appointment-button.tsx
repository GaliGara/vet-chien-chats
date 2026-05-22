"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type FloatingAppointmentButtonProps = {
  href?: string;
};

export function FloatingAppointmentButton({
  href = "#citas",
}: FloatingAppointmentButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <a
        href={href}
        aria-label="Agendar cita"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 grid size-14 place-items-center rounded-full border border-[#CDB3DC] bg-[#D9C6E8]/95 text-[#2F2433] shadow-[0_14px_34px_rgb(91_58_99/0.16)] outline-none backdrop-blur-xl transition hover:bg-[#CDB3DC] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45 sm:hidden"
      >
        <MouseHeadIcon className="size-8" />
      </a>

      <motion.a
        href={href}
        aria-label="Agendar cita"
        onFocus={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        onPointerEnter={() => setIsExpanded(true)}
        onPointerLeave={() => setIsExpanded(false)}
        initial={false}
        animate={{
          width: isExpanded ? 166 : 58,
          boxShadow: isExpanded
            ? "0 18px 44px rgb(91 58 99 / 0.18)"
            : "0 14px 34px rgb(91 58 99 / 0.16)",
        }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
        }
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-6 z-50 hidden h-14 max-w-[calc(100vw-2rem)] items-center gap-2 overflow-hidden rounded-full border border-[#CDB3DC] bg-[#D9C6E8]/95 px-3 text-sm font-semibold text-[#2F2433] shadow-[0_14px_34px_rgb(91_58_99/0.16)] outline-none backdrop-blur-xl transition-colors hover:bg-[#CDB3DC] focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45 sm:inline-flex"
      >
        <span className="grid size-8 shrink-0 place-items-center text-[#2F2433]">
          <MouseHeadIcon className="size-8" />
        </span>
        <motion.span
          aria-hidden={!isExpanded}
          animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : 8 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
          }
          className="whitespace-nowrap"
        >
          Agendar cita
        </motion.span>
      </motion.a>
    </>
  );
}

function MouseHeadIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={`${className} fill-current`}
      focusable="false"
    >
      <circle cx="9" cy="10" r="6" />
      <circle cx="23" cy="10" r="6" />
      <circle cx="16" cy="18" r="8" />
    </svg>
  );
}
