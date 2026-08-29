"use client";

import { useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { setLocale } from "@/lib/actions/locale";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function LanguageSwitcher({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const { locale } = useLocale();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale || pending) return;
    startTransition(() => {
      setLocale(next);
    });
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs",
        onDark ? "border-ivory/30" : "border-ink/10",
        pending && "opacity-60",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {(["fr", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          aria-pressed={locale === l}
          className={cn(
            // min-h-10 keeps the pills comfortably tappable inside the mobile
            // menu without changing the compact desktop navbar version.
            "flex min-h-10 items-center justify-center rounded-lg px-5 font-medium uppercase tracking-wider transition-colors sm:min-h-0 sm:rounded-full sm:px-2.5 sm:py-1",
            onDark
              ? locale === l
                ? "bg-ivory/20 text-ivory"
                : "text-ivory/70 hover:text-ivory"
              : locale === l
                ? "bg-amethyst-500/30 text-ink"
                : "text-ink/65 hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
