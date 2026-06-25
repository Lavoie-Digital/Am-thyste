import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { Container } from "@/components/ui/Container";
import { getI18n } from "@/lib/i18n/server";

export default async function CheckoutPage() {
  const { dict } = await getI18n();
  return (
    <div className="pb-24 pt-32">
      <Container className="max-w-5xl">
        <h1 className="mb-10 text-center font-display text-4xl tracking-wide text-ink sm:text-5xl">
          {dict.checkout.title}
        </h1>
        <CheckoutForm />
      </Container>
    </div>
  );
}
