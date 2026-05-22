"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type FloatingAppointmentButtonProps = {
  href?: string;
};

export function FloatingAppointmentButton({
  href = "#citas",
}: FloatingAppointmentButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsExpanded(true), 1200);
    const collapseTimer = window.setTimeout(() => setIsExpanded(false), 4200);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(collapseTimer);
    };
  }, []);

  function revealBriefly() {
    setIsExpanded(true);
    window.setTimeout(() => setIsExpanded(false), 2600);
  }

  return (
    <motion.a
      href={href}
      aria-label="Agendar cita"
      onFocus={() => setIsExpanded(true)}
      onBlur={() => setIsExpanded(false)}
      onPointerEnter={() => setIsExpanded(true)}
      onPointerLeave={() => setIsExpanded(false)}
      onPointerDown={revealBriefly}
      initial={false}
      animate={{
        width: isExpanded ? 164 : 56,
        boxShadow: isExpanded
          ? "0 18px 44px rgb(91 58 99 / 0.18)"
          : "0 14px 34px rgb(91 58 99 / 0.16)",
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
      }
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex h-14 w-14 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 overflow-hidden rounded-full border border-[#D9C6E8] bg-[#F7F1FA]/95 px-4 text-sm font-semibold text-[#2F2433] shadow-[0_14px_34px_rgb(91_58_99/0.16)] outline-none backdrop-blur-xl transition-colors hover:bg-[#D9C6E8]/85 focus-visible:ring-3 focus-visible:ring-[#DFA2BA]/45 sm:right-6"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/80 text-[#2F2433]">
        <MouseHeadIcon />
      </span>
      <motion.span
        aria-hidden={!isExpanded}
        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : 8 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
        }
        className="whitespace-nowrap"
      >
        Agendar cita
      </motion.span>
    </motion.a>
  );
}

function MouseHeadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="size-5 fill-current"
      focusable="false"
    >
      <circle cx="9" cy="10" r="6" />
      <circle cx="23" cy="10" r="6" />
      <circle cx="16" cy="18" r="8" />
    </svg>
  );
}
