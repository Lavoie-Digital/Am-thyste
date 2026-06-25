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
          <div className="space-y-6 text-amethyst-200/80">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amethyst-300/70">{dict.contact.location}</p>
              <p className="mt-2 text-lg text-amethyst-50">Rimouski, Québec</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amethyst-300/70">{dict.common.phone}</p>
              <a href="tel:+15815257219" className="mt-2 block text-lg text-amethyst-50 hover:text-white">581-525-7219</a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amethyst-300/70">{dict.footer.madeIn}</p>
              <p className="mt-2 text-lg text-ivory">Canada</p>
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
