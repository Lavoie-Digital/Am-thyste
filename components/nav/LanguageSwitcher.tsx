"use client";

import { useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { setLocale } from "@/lib/actions/locale";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function LanguageSwitcher({ className }: { className?: string }) {
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
        "inline-flex items-center rounded-full border border-amethyst-300/20 p-0.5 text-xs",
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
            locale === l
              ? "bg-amethyst-500/30 text-white"
              : "text-amethyst-200/70 hover:text-white",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
