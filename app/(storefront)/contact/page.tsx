import type { Metadata } from "next";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/storefront/ContactForm";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Contact" };

const FACEBOOK_URL = "https://www.facebook.com/AmethysteHairProducts";

/** Thin-line icons, brand stroke weight. */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 4h3l1.3 4-2 1.3a12 12 0 0 0 5.6 5.6l1.3-2 4 1.3v3a1.5 1.5 0 0 1-1.6 1.5C11.3 23.6 4.4 16.7 4.9 8.1A1.5 1.5 0 0 1 6.5 4Z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s7-5.7 7-11a7 7 0 0 0-14 0c0 5.3 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 8.5V7c0-.8.5-1.2 1.3-1.2H17V3h-2c-2.2 0-3.5 1.3-3.5 3.5v2H9.5V12h2v9h3v-9h2.2l.5-3.5h-2.7Z" />
    </svg>
  );
}

export default async function ContactPage() {
  const { dict } = await getI18n();

  const items = [
    { icon: <PhoneIcon />, label: dict.common.phone, value: "514-691-1899", href: "tel:+15146911899" },
    { icon: <PinIcon />, label: dict.contact.locationLabel, value: dict.contact.location },
    { icon: <FacebookIcon />, label: dict.contact.follow, value: dict.contact.facebook, href: FACEBOOK_URL, external: true },
  ];

  return (
    <>
      <PageHeader title={dict.contact.title} subtitle={dict.contact.desc} />
      <section className="pb-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow text-gold">{dict.contact.infoTitle}</p>
            <div className="mt-7 space-y-3">
              {items.map((it) => {
                const inner = (
                  <div className="group flex items-center gap-4 rounded-2xl border border-ink/8 bg-shell p-5 transition-colors duration-500 hover:border-gold/40">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amethyst-50 text-amethyst-600 transition-colors duration-500 group-hover:bg-gold/10 group-hover:text-gold">
                      {it.icon}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-ink-mute">{it.label}</p>
                      <p className="mt-1 text-lg text-ink">{it.value}</p>
                    </div>
                  </div>
                );
                if (!it.href) return <div key={it.label}>{inner}</div>;
                return (
                  <a
                    key={it.label}
                    href={it.href}
                    {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="block"
                  >
                    {inner}
                  </a>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl glass p-8">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
