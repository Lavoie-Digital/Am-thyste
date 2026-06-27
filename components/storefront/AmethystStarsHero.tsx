"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { ArrowRight } from "@/components/ui/icons";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const ease = [0.22, 1, 0.36, 1] as const;

/* Single static banner. Desktop keeps the full frame with a light wash on the
   left for the type; mobile crops onto the model's hair and lays a pearl wash
   over it so the dark headline stays legible. */
const BANNER = "/banner.jpg";

export function AmethystStarsHero() {
  const { dict } = useLocale();
  const h = dict.home;

  return (
    <section className="relative pt-[116px]">
      <div className="relative min-h-[60vh] w-full overflow-hidden lg:min-h-[74vh]">
        {/* Banner */}
        <Image
          src={BANNER}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover [object-position:70%_center] lg:[object-position:center]"
        />

        {/* Legibility washes — vertical on mobile, horizontal on desktop */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ivory/95 via-ivory/65 to-ivory/20 lg:hidden" />
        <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-ivory/95 via-ivory/55 to-transparent lg:block" />
        {/* Dissolve into the page below */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ivory" />

        <Container className="relative z-10 flex min-h-[60vh] items-center lg:min-h-[74vh]">
          <div className="max-w-xl py-16 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease }}
              className="eyebrow"
            >
              {h.heroEyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease }}
              className="mt-5 heading text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.04]"
            >
              {h.heroTitleLead}{" "}
              <span className="text-amethyst-500">{h.heroTitleAccent}</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.35, ease }}
              className="mt-7 flex items-center justify-center gap-3 lg:justify-start"
            >
              <span className="h-px w-12 bg-ink/25" />
              <ArrowRight className="h-4 w-4 text-ink/40" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.45, ease }}
              className="mx-auto mt-7 max-w-md text-base leading-relaxed text-ink/65 lg:mx-0"
            >
              {h.heroDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.55, ease }}
              className="mt-9 flex justify-center lg:justify-start"
            >
              <Link
                href="/boutique"
                className="group/btn inline-flex h-[3.25rem] items-center gap-2.5 rounded-full bg-ink px-9 text-xs uppercase tracking-[0.18em] text-ivory transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-amethyst-800 active:scale-[0.98]"
              >
                {h.heroCtaMain}
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
