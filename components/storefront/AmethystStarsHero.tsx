"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { StarField } from "./StarField";
import { Mark } from "@/components/ui/icons";

const ease = [0.22, 1, 0.36, 1] as const;

export function AmethystStarsHero() {
  const { dict } = useLocale();

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <StarField className="absolute inset-0 h-full w-full" />

      {/* Floating amethyst stones */}
      <FloatingCrystal className="left-[7%] top-[20%] h-16 w-12 sm:h-24 sm:w-16" delay={0} dur={9} />
      <FloatingCrystal className="right-[9%] top-[26%] h-20 w-14 sm:h-28 sm:w-20" delay={1.4} dur={11} />
      <FloatingCrystal className="left-[13%] bottom-[16%] h-12 w-9 sm:h-20 sm:w-14" delay={0.7} dur={10} />
      <FloatingCrystal className="right-[15%] bottom-[20%] h-14 w-10 sm:h-24 sm:w-16" delay={2} dur={12} />

      {/* Bottom legibility fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night-900 to-transparent" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Crest — logo mis en valeur, animé */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-24 w-24 sm:h-28 sm:w-28"
          >
            {/* pulsing solid hairline ring */}
            <motion.span
              aria-hidden
              animate={{ opacity: [0.25, 0.6, 0.25], scale: [0.96, 1.04, 0.96] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-3 rounded-full border border-amethyst-200/30"
            />
            {/* slow dashed ring */}
            <motion.span
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-5 rounded-full border border-dashed border-amethyst-300/20"
            />
            {/* logo */}
            <span className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-amethyst-200/40">
              <Image src="/logo.jpeg" alt="Améthyste" fill sizes="128px" className="object-cover" priority />
            </span>
            {/* orbiting mark */}
            <motion.span
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-5"
            >
              <Mark className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 text-amethyst-100/70" />
            </motion.span>
          </motion.div>
        </motion.div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease }}
          className="eyebrow mt-8"
        >
          {dict.home.ritualBadge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.5, ease }}
          className="mt-4 heading text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.95]"
        >
          AMÉTHYSTE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.7, ease }}
          className="mt-4 flex items-center gap-4"
        >
          <span className="h-px w-10 bg-amethyst-400/40" />
          <span className="font-serif-lux text-xs uppercase tracking-[0.5em] text-amethyst-200/80 sm:text-sm">Hair Botox</span>
          <span className="h-px w-10 bg-amethyst-400/40" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.85, ease }}
          className="mt-6 max-w-md font-serif-lux text-lg font-light italic leading-relaxed text-amethyst-100/85 sm:text-xl"
        >
          {dict.brand.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 1, ease }}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/boutique"
            className="inline-flex h-[3.25rem] items-center rounded-full bg-[#efe9e1] px-9 text-xs uppercase tracking-[0.18em] text-[#0b0810] transition-colors duration-500 hover:bg-[#e3d8c6]"
          >
            {dict.home.heroCta}
          </Link>
          <Link
            href="/a-propos"
            className="inline-flex h-[3.25rem] items-center rounded-full border border-[#bfaecb]/30 px-9 text-xs uppercase tracking-[0.18em] text-[#efe9e1] transition-colors duration-500 hover:border-[#bfaecb]/55"
          >
            {dict.home.heroCtaSecondary}
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-9 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <Mark className="h-2.5 w-2.5 text-amethyst-300/60" />
        <span className="h-12 w-px overflow-hidden bg-amethyst-300/15">
          <motion.span
            animate={{ y: ["-100%", "180%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="block h-4 w-px bg-amethyst-200/70"
          />
        </span>
      </motion.div>
    </section>
  );
}

/** A slowly-floating faceted amethyst stone — quiet, low-opacity ambience. */
function FloatingCrystal({
  className,
  delay,
  dur,
}: {
  className: string;
  delay: number;
  dur: number;
}) {
  const gid = `am-${delay}-${dur}`;
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.5, 0.42], y: [0, -16, 0], rotate: [-3, 3, -3] }}
      transition={{
        opacity: { duration: 2.4, delay },
        y: { duration: dur, repeat: Infinity, ease: "easeInOut", delay },
        rotate: { duration: dur * 1.3, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      <svg viewBox="0 0 60 100" className="h-full w-full drop-shadow-[0_8px_26px_rgba(83,65,93,0.5)]">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d6c9de" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#836d92" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#382c42" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* faceted gem body */}
        <polygon points="30,2 50,30 42,98 18,98 10,30" fill={`url(#${gid})`} stroke="rgba(214,201,222,0.45)" strokeWidth="0.75" />
        {/* table + inner facets */}
        <polygon points="30,2 50,30 30,34 10,30" fill="rgba(239,233,225,0.18)" />
        <polygon points="30,34 42,98 30,98" fill="rgba(255,255,255,0.08)" />
        <polygon points="30,34 18,98 30,98" fill="rgba(0,0,0,0.12)" />
        <line x1="10" y1="30" x2="42" y2="98" stroke="rgba(214,201,222,0.25)" strokeWidth="0.5" />
        <line x1="50" y1="30" x2="18" y2="98" stroke="rgba(214,201,222,0.25)" strokeWidth="0.5" />
      </svg>
    </motion.div>
  );
}
