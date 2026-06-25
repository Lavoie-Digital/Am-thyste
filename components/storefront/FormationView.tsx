"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
// Stroke that draws itself in when scrolled into view.
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 1, ease } },
};

type FormatKind = "presentiel" | "ecole" | "virtuel";

export interface FormationContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string[];
  formatsLabel: string;
  formats: { kind: FormatKind; t: string; d: string }[];
  webinarBadge: string;
  webinarTitle: string;
  webinarDesc: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageAlt: string;
}

export function FormationView({ c }: { c: FormationContent }) {
  return (
    <section className="px-0 pb-24 pt-32 sm:pt-36">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, ease }}
            className="relative aspect-[3/4] overflow-hidden rounded-sm bg-bone ring-1 ring-ink/[0.05] lg:sticky lg:top-28"
          >
            <Image
              src="/démo.jpeg"
              alt={c.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              priority
            />
          </motion.div>

          {/* All the info, condensed */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
            <motion.p variants={item} className="eyebrow">
              {c.eyebrow}
            </motion.p>
            <motion.h1 variants={item} className="mt-4 heading text-4xl sm:text-5xl">
              {c.title}
            </motion.h1>
            <motion.p variants={item} className="mt-4 font-serif-lux text-lg italic text-ink/60">
              {c.subtitle}
            </motion.p>

            {c.intro.map((p, i) => (
              <motion.p key={i} variants={item} className="mt-5 max-w-xl leading-relaxed text-ink/65">
                {p}
              </motion.p>
            ))}

            {/* Formats — compact icon rows */}
            <motion.p variants={item} className="mt-10 text-[10px] uppercase tracking-[0.28em] text-ink-mute">
              {c.formatsLabel}
            </motion.p>
            <div className="mt-4 divide-y divide-ink/8 border-y border-ink/8">
              {c.formats.map((f) => (
                <motion.div key={f.kind} variants={item} className="group flex items-center gap-4 py-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amethyst-50 text-amethyst-600 ring-1 ring-ink/[0.05] transition-all duration-500 group-hover:scale-105 group-hover:bg-amethyst-100 group-hover:text-amethyst-700">
                    <FormatIcon kind={f.kind} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display tracking-wide text-ink">{f.t}</h3>
                    <p className="text-sm leading-snug text-ink/55">{f.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Webinar — compact highlight */}
            <motion.div
              variants={item}
              className="mt-8 flex items-start gap-4 rounded-2xl border border-ink/8 bg-bone/60 p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amethyst-50 text-amethyst-600 ring-1 ring-ink/[0.05]">
                <WebinarIcon />
              </span>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.06] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-gold">
                  <motion.span
                    aria-hidden
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 0.85, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-1.5 w-1.5 rounded-full bg-gold"
                  />
                  {c.webinarBadge}
                </span>
                <h3 className="mt-2 font-display tracking-wide text-ink">{c.webinarTitle}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">{c.webinarDesc}</p>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={item} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/contact" variant="gold" size="lg">
                {c.ctaPrimary}
              </ButtonLink>
              <ButtonLink href="/pro" variant="ghost" size="lg">
                {c.ctaSecondary}
              </ButtonLink>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/* ---- Ultra-light line icons that draw themselves in on scroll ---- */

function FormatIcon({ kind }: { kind: FormatKind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    variants: draw,
  };
  return (
    <motion.svg viewBox="0 0 48 48" className="h-5 w-5" initial="hidden" whileInView="show" viewport={{ once: true }}>
      {kind === "presentiel" && (
        <>
          <motion.circle cx="24" cy="17" r="6" {...common} />
          <motion.path d="M12 36c0-6.6 5.4-11 12-11s12 4.4 12 11" {...common} />
        </>
      )}
      {kind === "ecole" && (
        <>
          <motion.path d="M24 13 42 21 24 29 6 21Z" {...common} />
          <motion.path d="M14 24v7c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5v-7" {...common} />
          <motion.path d="M42 21v8" {...common} />
        </>
      )}
      {kind === "virtuel" && (
        <>
          <motion.rect x="7" y="11" width="34" height="24" rx="3" {...common} />
          <motion.path d="M19 41h10M24 35v6" {...common} />
          <motion.path d="M21 18.5 29 23l-8 4.5Z" {...common} />
        </>
      )}
    </motion.svg>
  );
}

function WebinarIcon() {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    variants: draw,
  };
  return (
    <motion.svg viewBox="0 0 48 48" className="h-5 w-5" initial="hidden" whileInView="show" viewport={{ once: true }}>
      <motion.rect x="9" y="12" width="30" height="27" rx="3" {...common} />
      <motion.path d="M9 20h30M17 8v6M31 8v6" {...common} />
      <motion.path d="M22 27.5 28 31l-6 3.5Z" {...common} />
    </motion.svg>
  );
}
