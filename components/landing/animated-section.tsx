"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  id,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0.98, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        shouldReduceMotion
          ? undefined
          : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }
      }
    >
      {children}
    </motion.section>
  );
}

export function MotionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      transition={
        shouldReduceMotion ? undefined : { duration: 0.25, ease: "easeOut" }
      }
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "show"}
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      variants={
        shouldReduceMotion
          ? undefined
          : {
              hidden: { opacity: 0.96, y: 18, filter: "blur(0px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)" },
            }
      }
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
