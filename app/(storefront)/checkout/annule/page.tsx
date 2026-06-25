import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getI18n } from "@/lib/i18n/server";

export default async function CheckoutCancelPage() {
  const { dict } = await getI18n();
  return (
    <div className="flex min-h-[80svh] items-center justify-center py-32">
      <Container className="max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-bone/70 text-3xl ring-1 ring-ink/10">
          ↺
        </div>
        <h1 className="font-display text-4xl tracking-wide text-ink">{dict.checkout.cancelTitle}</h1>
        <p className="mt-4 leading-relaxed text-ink/65">{dict.checkout.cancelDesc}</p>
        <Link href="/checkout" className="mt-8 inline-block rounded-full border border-ink/10 px-8 py-3.5 text-sm font-medium text-ink hover:bg-ink/[0.04]">
          {dict.cart.checkout}
        </Link>
      </Container>
    </div>
  );
}
