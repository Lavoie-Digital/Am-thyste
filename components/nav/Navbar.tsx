"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCart } from "@/lib/cart/CartContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { Gem, Search } from "@/components/ui/icons";
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
    { href: "/", label: dict.nav.home },
    { href: "/boutique", label: dict.nav.shop },
    { href: "/entretien", label: dict.nav.entretien },
    { href: "/pro", label: dict.nav.pro },
    { href: "/formation", label: dict.nav.formation },
    { href: "/a-propos", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  // Split the desktop links around the centered logo so they never overlap it.
  const leftLinks = links.slice(0, 4);
  const rightLinks = links.slice(4);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-ink text-ivory">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 text-[10.5px] uppercase tracking-[0.2em] sm:px-8">
          <span className="hidden text-ivory/70 sm:block">{dict.topbar.left}</span>
          <span className="mx-auto text-center text-ivory/85 sm:mx-0">{dict.topbar.center}</span>
          <span className="hidden text-ivory/70 sm:block">{dict.topbar.right}</span>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b transition-shadow duration-500",
          scrolled
            ? "glass-strong border-ink/8 shadow-[0_18px_40px_-32px_rgba(10,7,12,0.5)]"
            : "border-ink/[0.06] bg-ivory/90 backdrop-blur-md",
        )}
      >
        <nav className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Center — logo (absolutely centered so the links keep their natural width) */}
          <Link
            href="/"
            className="group absolute left-1/2 flex -translate-x-1/2 flex-col items-center justify-center leading-none"
          >
            <Gem className="h-9 w-auto text-amethyst-500 transition-transform duration-500 group-hover:scale-105" />
            <span className="mt-1.5 font-display text-lg tracking-[0.3em] text-ink">AMÉTHYSTE</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.42em] text-ink-mute">{dict.brand.logoSub}</span>
          </Link>

          {/* Left — desktop links / mobile menu toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="-ml-2 rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink lg:hidden"
            >
              <MenuIcon open={menuOpen} />
            </button>

            <div className="hidden items-center overflow-hidden lg:flex lg:max-w-[calc(50vw-9rem)]">
              {leftLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "whitespace-nowrap px-2 py-2 text-[0.64rem] uppercase tracking-[0.05em] transition-colors xl:px-2.5 xl:text-[0.68rem] xl:tracking-[0.08em]",
                    isActive(l.href) ? "text-ink" : "text-ink/55 hover:text-ink",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — desktop links (after the logo) + actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden items-center overflow-hidden lg:flex lg:max-w-[calc(50vw-9rem)]">
              {rightLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "whitespace-nowrap px-2 py-2 text-[0.64rem] uppercase tracking-[0.05em] transition-colors xl:px-2.5 xl:text-[0.68rem] xl:tracking-[0.08em]",
                    isActive(l.href) ? "text-ink" : "text-ink/55 hover:text-ink",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <Link
              href="/boutique"
              aria-label={dict.nav.shop}
              className="rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
            >
              <Search />
            </Link>

            <LanguageSwitcher className="hidden sm:inline-flex" />

            <Link
              href={user ? (role === "admin" ? "/tableau-de-bord" : "/pro/espace") : "/pro/connexion"}
              aria-label={dict.nav.account}
              className="rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
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
              className="relative rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
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
          </div>
        </nav>
      </div>

      {/* Mobile menu — full-screen pearl overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-ivory lg:hidden"
          >
            <nav className="flex flex-1 flex-col px-6 pt-32">
              {links.map((l, i) => (
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
                      isActive(l.href) ? "text-ink" : "text-ink/70 hover:text-ink",
                    )}
                  >
                    {l.label}
                    <span className={cn("font-sans text-xs tracking-[0.2em]", isActive(l.href) ? "text-gold" : "text-ink-mute/40")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </motion.div>
              ))}
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
