"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function Footer() {
  const { dict } = useLocale();
  const year = 2026;

  return (
    <footer className="relative mt-32 border-t border-ink/10 bg-bone">
      {/*
        minmax(0,…) instead of a bare `1.5fr`: an `fr` track cannot shrink below
        its min-content width, and a wide-tracking heading forced
        its column to ~199px. That pushed the grid past the viewport and gave
        every page ~34px of horizontal scroll at tablet width.
      */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)] md:gap-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-ink/10">
              <Image src="/logo.jpeg" alt="Améthyste" fill sizes="48px" className="object-cover" />
            </span>
            <span className="font-display text-xl tracking-[0.25em] text-ink">
              AMÉTHYSTE
            </span>
          </div>
          <p className="mt-5 max-w-xs font-serif-lux text-lg italic leading-relaxed text-ink/70">
            «&nbsp;{dict.brand.tagline}&nbsp;»
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-ink-mute">
            {dict.footer.shop}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/60">
            <li><Link href="/boutique" className="transition-colors hover:text-ink">{dict.nav.shop}</Link></li>
            <li><Link href="/pro" className="transition-colors hover:text-ink">{dict.nav.pro}</Link></li>
            <li><Link href="/entretien" className="transition-colors hover:text-ink">{dict.nav.entretien}</Link></li>
            <li><Link href="/formation" className="transition-colors hover:text-ink">{dict.nav.formation}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-ink-mute">
            {dict.footer.company}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/60">
            <li><Link href="/a-propos" className="transition-colors hover:text-ink">{dict.nav.about}</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-ink">{dict.nav.contact}</Link></li>
          </ul>
        </div>

        {/*
          No newsletter signup here: the privacy policy states that no newsletter
          is sent. If one is added later, it needs express CASL consent and a
          matching update to /confidentialite first.
        */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-ink-mute">
            {dict.footer.contact}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink/60">
            <li>
              <a href="mailto:info@amethystehairproductscanada.ca" className="break-all transition-colors hover:text-ink">
                info@amethystehairproductscanada.ca
              </a>
            </li>
            <li>
              <a href="tel:+15146911899" className="transition-colors hover:text-ink">514-691-1899</a>
            </li>
            <li>{dict.contact.location}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-ink/45 sm:flex-row sm:px-8">
          <p>© {year} Améthyste. {dict.footer.rights}</p>
          <p className="tracking-wide">
            Création de{" "}
            <a
              href="https://lavoiedigital.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              Lavoie Digital
            </a>
          </p>
          <div className="flex gap-4">
            <Link href="/confidentialite" className="transition-colors hover:text-ink">{dict.footer.privacy}</Link>
            <Link href="/conditions" className="transition-colors hover:text-ink">{dict.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
