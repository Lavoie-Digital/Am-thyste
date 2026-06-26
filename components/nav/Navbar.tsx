"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCart } from "@/lib/cart/CartContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { dict } = useLocale();
  const { count, toggle } = useCart();
  const { user, role } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock body scroll while the full-screen menu is open, and allow Escape to close.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const links = [
    { href: "/boutique", label: dict.nav.shop },
    { href: "/pro", label: dict.nav.pro },
    { href: "/entretien", label: dict.nav.entretien },
    { href: "/formation", label: dict.nav.formation },
    { href: "/a-propos", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  // Over the photographic hero (home, not yet scrolled) the bar floats on a
  // dark scrim → ivory type. Everywhere else it sits on ivory → ink type.
  const overHero = pathname === "/" && !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "glass-strong border-b border-ink/8"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="relative z-50 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className={cn("relative h-11 w-11 overflow-hidden rounded-full ring-1 transition-transform duration-500 group-hover:scale-105", overHero ? "ring-ivory/50" : "ring-ink/15")}>
            <Image src="/logo.jpeg" alt="Améthyste" fill sizes="44px" className="object-cover" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className={cn("font-display text-lg tracking-[0.25em]", overHero ? "text-ivory" : "text-ink")}>
              AMÉTHYSTE
            </span>
            <span className={cn("text-[10px] uppercase tracking-[0.3em]", overHero ? "text-ivory/70" : "text-ink-mute")}>
              Professional Haircare
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-3.5 py-2 text-sm tracking-wide transition-colors",
                  overHero
                    ? active
                      ? "text-ivory"
                      : "text-ivory/70 hover:text-ivory"
                    : active
                      ? "text-ink"
                      : "text-ink/55 hover:text-ink",
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className={cn("absolute inset-x-3 -bottom-0.5 h-px", overHero ? "bg-ivory/80" : "bg-amethyst-500")}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="hidden sm:inline-flex" onDark={overHero} />

          <Link
            href={user ? (role === "admin" ? "/tableau-de-bord" : "/pro/espace") : "/pro/connexion"}
            aria-label={dict.nav.account}
            className={cn("rounded-full p-2 transition-colors", overHero ? "text-ivory/85 hover:bg-ivory/10 hover:text-ivory" : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink")}
          >
            <UserIcon />
          </Link>

          {role === "admin" && (
            <Link
              href="/admin"
              className="hidden rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold/10 sm:inline-block"
            >
              {dict.nav.admin}
            </Link>
          )}

          <button
            onClick={toggle}
            aria-label={dict.nav.cart}
            className={cn("relative rounded-full p-2 transition-colors", overHero ? "text-ivory/85 hover:bg-ivory/10 hover:text-ivory" : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink")}
          >
            <CartIcon />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-ivory"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className={cn("rounded-full p-2 lg:hidden", overHero ? "text-ivory/85 hover:bg-ivory/10 hover:text-ivory" : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink")}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — full-screen cream overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-ivory lg:hidden"
          >
            <nav className="flex flex-1 flex-col px-6 pt-28">
              {links.map((l, i) => {
                const active = pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={l.href}
                      className={cn(
                        "flex items-baseline justify-between border-b border-ink/8 py-5 font-display text-2xl tracking-wide transition-colors",
                        active ? "text-ink" : "text-ink/70 hover:text-ink",
                      )}
                    >
                      {l.label}
                      <span className={cn("text-xs font-sans tracking-[0.2em]", active ? "text-gold" : "text-ink-mute/40")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <div className="px-6 pb-10">
              <LanguageSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 7h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 7Z" strokeLinejoin="round" />
      <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}
