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
        "rounded-full border border-ink/10 px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink",
        className,
      )}
    >
      {dict.nav.logout}
    </button>
  );
}
