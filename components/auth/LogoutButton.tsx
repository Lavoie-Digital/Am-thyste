"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const { signOut } = useAuth();
  const { dict } = useLocale();
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className={cn(
        "rounded-full border border-amethyst-300/25 px-4 py-2 text-sm text-amethyst-100/80 transition-colors hover:bg-white/5 hover:text-white",
        className,
      )}
    >
      {dict.nav.logout}
    </button>
  );
}
