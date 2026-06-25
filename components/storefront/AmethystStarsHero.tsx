"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const ease = [0.22, 1, 0.36, 1] as const;

/* Background images per breakpoint, slowly cross-fading with a gentle
   Ken-Burns drift, then dissolving into the ivory page below. Each set cycles
   by its own length, so mobile (3) and desktop (2) stay independent. */
const DESKTOP_IMAGES = ["/description banner.jpeg", "/femmehero.jpeg", "/ChatGPT Image 19 janv_edited_edited.avif"];
const MOBILE_IMAGES = ["/femme2.jpeg", "/femmevertical.jpeg", "/femme.jpeg"];
const SLIDE_MS = 6000;

export function AmethystStarsHero() {
  const { dict } = useLocale();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => i + 1), SLIDE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Background slideshow */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 lg:hidden">
          {MOBILE_IMAGES.map((src, i) => (
            <Slide key={src} src={src} active={i === idx % MOBILE_IMAGES.length} priority={i === 0} position="center 22%" />
          ))}
        </div>
        <div className="absolute inset-0 hidden lg:block">
          {DESKTOP_IMAGES.map((src, i) => (
            <Slide key={src} src={src} active={i === idx % DESKTOP_IMAGES.length} priority={i === 0} />
          ))}
        </div>
      </div>

      {/* Legibility scrim — keeps white type crisp without crushing the photo */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/25 to-ink/35" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/40 to-transparent" />

      {/* Smooth dissolve into the ivory page below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%]"
        style={{ background: "linear-gradient(to bottom, transparent, #faf7f2 94%)" }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease }}
          className="text-[0.6875rem] uppercase tracking-[0.34em] text-ivory/85"
        >
          {dict.home.ritualBadge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.5, ease }}
          className="mt-4 font-display text-[clamp(2.5rem,8vw,6.5rem)] font-medium leading-[0.95] tracking-[0.01em] text-ivory drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
        >
          AMÉTHYSTE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.7, ease }}
          className="mt-4 flex items-center gap-4"
        >
          <span className="h-px w-10 bg-gold/70" />
          <span className="font-serif-lux text-xs uppercase tracking-[0.5em] text-ivory/90 sm:text-sm">Hair Botox</span>
          <span className="h-px w-10 bg-gold/70" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.85, ease }}
          className="mt-6 max-w-md font-serif-lux text-lg font-light italic leading-relaxed text-ivory/90 drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)] sm:text-xl"
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
            className="inline-flex h-[3.25rem] items-center rounded-full bg-ivory px-9 text-xs uppercase tracking-[0.18em] text-ink transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-bone active:scale-[0.98]"
          >
            {dict.home.heroCta}
          </Link>
          <Link
            href="/a-propos"
            className="inline-flex h-[3.25rem] items-center rounded-full border border-ivory/45 px-9 text-xs uppercase tracking-[0.18em] text-ivory transition-all duration-500 hover:border-ivory hover:bg-ivory/10"
          >
            {dict.home.heroCtaSecondary}
          </Link>
        </motion.div>
      </div>

      {/* Slideshow indicators — one set per breakpoint */}
      <div className="absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 lg:hidden">
        <Dots count={MOBILE_IMAGES.length} idx={idx} onSelect={setIdx} />
      </div>
      <div className="absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-2.5 lg:flex">
        <Dots count={DESKTOP_IMAGES.length} idx={idx} onSelect={setIdx} />
      </div>
    </section>
  );
}

function Dots({ count, idx, onSelect }: { count: number; idx: number; onSelect: (i: number) => void }) {
  const active = idx % count;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          aria-label={`Image ${i + 1}`}
          onClick={() => onSelect(i)}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: i === active ? "1.75rem" : "0.375rem",
            backgroundColor: i === active ? "rgba(250,247,242,0.95)" : "rgba(250,247,242,0.45)",
          }}
        />
      ))}
    </>
  );
}

function Slide({
  src,
  active,
  priority,
  position = "center",
}: {
  src: string;
  active: boolean;
  priority?: boolean;
  position?: string;
}) {
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1.04 : 1 }}
      transition={{
        opacity: { duration: 1.8, ease },
        scale: { duration: SLIDE_MS / 1000 + 1.8, ease: "linear" },
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </motion.div>
  );
}
