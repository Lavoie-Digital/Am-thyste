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
        "inline-flex items-center rounded-full border p-0.5 text-xs",
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
            "rounded-full px-2.5 py-1 font-medium uppercase tracking-wider transition-colors",
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
