"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ArrowRight } from "@/components/ui/icons";

export function Footer() {
  const { dict } = useLocale();
  const year = 2026;

  return (
    <footer className="relative mt-32 border-t border-amethyst-300/15">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-amethyst-300/30">
              <Image src="/logo.jpeg" alt="Améthyste" fill sizes="48px" className="object-cover" />
            </span>
            <span className="font-display text-xl tracking-[0.25em] text-amethyst-50">
              AMÉTHYSTE
            </span>
          </div>
          <p className="mt-5 max-w-xs font-serif-lux text-lg italic leading-relaxed text-amethyst-200/80">
            « {dict.brand.tagline} »
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-amethyst-300/70">
            {dict.footer.shop}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-amethyst-100/70">
            <li><Link href="/boutique" className="hover:text-white">{dict.nav.shop}</Link></li>
            <li><Link href="/pro" className="hover:text-white">{dict.nav.pro}</Link></li>
            <li><Link href="/entretien" className="hover:text-white">{dict.nav.entretien}</Link></li>
            <li><Link href="/formation" className="hover:text-white">{dict.nav.formation}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-amethyst-300/70">
            {dict.footer.company}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-amethyst-100/70">
            <li><Link href="/a-propos" className="hover:text-white">{dict.nav.about}</Link></li>
            <li><Link href="/contact" className="hover:text-white">{dict.nav.contact}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-amethyst-300/70">
            {dict.footer.newsletter}
          </h4>
          <form className="mt-4 flex items-center gap-3 border-b border-amethyst-300/20 pb-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={dict.common.email}
              className="flex-1 bg-transparent text-sm text-ivory placeholder:text-amethyst-200/40 focus:outline-none"
            />
            <button aria-label={dict.common.send} className="text-amethyst-200/70 transition-colors hover:text-ivory">
              <ArrowRight />
            </button>
          </form>
          <p className="mt-4 text-sm text-amethyst-200/60">{dict.contact.location} · 581-525-7219</p>
        </div>
      </div>

      <div className="border-t border-amethyst-300/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-amethyst-200/50 sm:flex-row sm:px-8">
          <p>© {year} Améthyste. {dict.footer.rights}</p>
          <p className="tracking-wide">{dict.footer.madeIn}</p>
          <div className="flex gap-4">
            <Link href="/confidentialite" className="hover:text-white">{dict.footer.privacy}</Link>
            <Link href="/conditions" className="hover:text-white">{dict.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
