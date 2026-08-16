import { CheckoutSuccess } from "@/components/storefront/CheckoutSuccess";
import { noindexMetadata } from "@/lib/seo/site";

export const metadata = noindexMetadata("Commande confirmée");

export default function CheckoutSuccessPage() {
  return <CheckoutSuccess />;
}
