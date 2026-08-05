import { redirect } from "next/navigation";

// Checkout now happens in an embedded Square payment modal opened from the cart drawer.
// This standalone route is kept only to redirect any stale links back to the shop.
export default function CheckoutPage() {
  redirect("/boutique");
}
