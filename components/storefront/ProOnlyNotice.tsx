"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const STORAGE_KEY = "amethyste:pro-notice-dismissed";

/**
 * Shown once per browser on arrival: tells regular customers that Hair Botox
 * is only sold to approved pro accounts. Hidden for approved pros and admins.
 */
export function ProOnlyNotice() {
  const { dict } = useLocale();
  const { loading, role, proStatus } = useAuth();
  const [open, setOpen] = useState(false);
  const dismissBtn = useRef<HTMLButtonElement>(null);
  const t = dict.proNotice;

  const isPro = role === "admin" || (role === "pro" && proStatus === "approved");

  useEffect(() => {
    if (loading || isPro) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (dismissed) return;
    const id = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(id);
  }, [loading, isPro]);

  // A pro signing in while the notice is open shouldn't keep seeing it.
  const visible = open && !isPro;

  useEffect(() => {
    if (!visible) return;
    dismissBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[80] bg-ivory/80 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pro-notice-title"
              aria-describedby="pro-notice-body"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="glass-strong pointer-events-auto relative w-full max-w-md rounded-3xl p-7 text-center sm:p-9"
            >
              <button
                onClick={dismiss}
                aria-label={t.close}
                className="absolute right-4 top-4 rounded-full p-1.5 text-ink/65 hover:bg-ink/[0.04] hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>

              <p className="text-[11px] uppercase tracking-[0.24em] text-amethyst-500">Hair Botox</p>
              <h2 id="pro-notice-title" className="mt-3 font-display text-2xl tracking-[0.04em] text-ink">
                {t.title}
              </h2>
              <p id="pro-notice-body" className="mt-4 text-sm leading-relaxed text-ink/70">
                {t.body}
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <Link
                  href="/pro/inscription"
                  onClick={dismiss}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#211a2c] px-7 text-xs uppercase tracking-[0.16em] text-[#faf7f2] transition-colors hover:bg-[#382c42]"
                >
                  {t.cta}
                </Link>
                <button
                  ref={dismissBtn}
                  onClick={dismiss}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-7 text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink/[0.04]"
                >
                  {t.dismiss}
                </button>
                <Link
                  href="/pro/connexion"
                  onClick={dismiss}
                  className="mt-1 text-xs text-ink/60 underline-offset-4 hover:text-ink hover:underline"
                >
                  {t.login}
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
