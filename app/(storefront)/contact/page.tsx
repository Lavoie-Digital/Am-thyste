import type { Metadata } from "next";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/storefront/ContactForm";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { dict } = await getI18n();
  return (
    <>
      <PageHeader title={dict.contact.title} subtitle={dict.contact.desc} />
      <section className="pb-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6 text-ink/70">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-mute">{dict.common.phone}</p>
              <a href="tel:+15146911899" className="mt-2 block text-lg text-ink hover:text-ink">514-691-1899</a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-mute">{dict.footer.madeIn}</p>
              <p className="mt-2 text-lg text-ink">Canada</p>
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
