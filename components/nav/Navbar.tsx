"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCart } from "@/lib/cart/CartContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { Gem } from "@/components/ui/icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { dict } = useLocale();
  const { count, toggle } = useCart();
  const { user, role, proStatus, signOut } = useAuth();
  const isApprovedPro = role === "pro" && proStatus === "approved";
  const canBecomePro = !!user && role === "customer";
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

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
    { href: "/formation", label: dict.nav.formation },
    { href: "/pro", label: dict.nav.pro },
    { href: "/a-propos", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  // Split the desktop links around the centered logo so they never overlap it.
  const leftLinks = links.slice(0, 5);
  const rightLinks = links.slice(5);

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
        <nav className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Center — logo (absolutely centered so the links keep their natural width) */}
          <Link
            href="/"
            className="group absolute left-1/2 flex -translate-x-1/2 flex-col items-center justify-center leading-none"
          >
            <span className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-ink/10 transition-transform duration-500 group-hover:scale-105">
              <Image src="/logo.jpeg" alt="Améthyste" fill sizes="40px" className="object-cover" priority />
            </span>
            <Image
              src="/amethyste-wordmark.png"
              alt="Améthyste"
              width={344}
              height={119}
              priority
              className="mt-1.5 h-9 w-auto"
            />
          </Link>

          {/* Left — desktop links / mobile menu toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              aria-expanded={menuOpen}
              className="-ml-2 rounded-full p-3 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink sm:p-2 lg:hidden"
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

            <LanguageSwitcher className="hidden sm:inline-flex" />

            {isApprovedPro && (
              <span
                title={dict.nav.pro}
                className="hidden items-center gap-1.5 rounded-full border border-amethyst-400/40 bg-amethyst-500/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-amethyst-600 sm:inline-flex"
              >
                <Gem className="h-3 w-3" />
                Pro
              </span>
            )}

            {canBecomePro && (
              <Link
                href="/pro/inscription"
                className="hidden items-center gap-1.5 rounded-full border border-amethyst-400/40 bg-amethyst-500/10 px-3 py-1.5 text-[11px] font-medium tracking-wide text-amethyst-600 transition-colors hover:bg-amethyst-500/20 sm:inline-flex"
              >
                <Gem className="h-3 w-3" />
                {dict.pro.becomeProBadge}
              </Link>
            )}

            <Link
              href={user ? (role === "admin" ? "/tableau-de-bord" : "/pro/espace") : "/pro/connexion"}
              aria-label={dict.nav.account}
              className="rounded-full p-3 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink sm:p-2"
            >
              <UserIcon />
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                aria-label={dict.nav.logout}
                title={dict.nav.logout}
                className="hidden rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink/60 transition-colors hover:bg-ink/[0.04] hover:text-ink sm:inline-block"
              >
                {dict.nav.logout}
              </button>
            )}

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
              className="relative rounded-full p-3 text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink sm:p-2"
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
            {/*
              Overlay header: brand on the left, an unmistakable bordered close
              button on the right. It sits outside the scrolling area, because
              the overlay is a child of the z-50 header and therefore paints
              over the navbar — this is the only way back out.
            */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/8 px-4">
              {/* The brand lockup is a real link home, like every other logo. */}
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                aria-label={dict.nav.home}
                className="-ml-1 flex min-h-11 items-center gap-2.5 rounded-full px-1 pr-3 transition-colors active:bg-ink/[0.04]"
              >
                <span className="relative h-7 w-7 overflow-hidden rounded-full ring-1 ring-ink/10">
                  <Image src="/logo.jpeg" alt="" fill sizes="28px" className="object-cover" />
                </span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-ink/50">
                  {dict.brand.name}
                </span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label={dict.nav.closeMenu}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white/60 text-ink/70 transition-colors active:bg-ink/[0.06] active:text-ink"
              >
                <MenuIcon open />
              </button>
            </div>

            {/*
              Scrollable middle. The spacing is tuned so everything fits an
              iPhone viewport (~656px with Safari's toolbars up) without
              scrolling, but overflow-y stays on as a safety net for small
              phones — the account actions used to be clipped off-screen.
            */}
            <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-5 pt-3">
              <nav className="flex flex-col gap-0.5">
                {links.map((l, i) => {
                  const active = isActive(l.href);
                  return (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.03 + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/*
                        onClick closes the menu on every tap — including a tap on
                        the page you are already on. Relying on the `pathname`
                        effect alone left the overlay stuck open in that case,
                        which read as the menu being broken.
                      */}
                      <Link
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 transition-colors",
                          active
                            ? "bg-amethyst-500/10 text-ink"
                            : "text-ink/75 active:bg-ink/[0.04] active:text-ink",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                              active ? "bg-gold" : "bg-ink/15",
                            )}
                          />
                          <span className="font-display text-xl tracking-wide">{l.label}</span>
                        </span>
                        <ChevronRight className={active ? "text-gold" : "text-ink/25"} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Account + shop actions, as labelled buttons rather than bare text. */}
              <div className="mt-auto space-y-2 pt-5">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={user ? (role === "admin" ? "/tableau-de-bord" : "/pro/espace") : "/pro/connexion"}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ink/12 bg-white/50 text-[11px] uppercase tracking-[0.14em] text-ink/70 transition-colors active:bg-ink/[0.05]"
                  >
                    <UserIcon className="h-4 w-4" />
                    {user ? dict.nav.account : dict.nav.login}
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      toggle();
                    }}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ink/12 bg-white/50 text-[11px] uppercase tracking-[0.14em] text-ink/70 transition-colors active:bg-ink/[0.05]"
                  >
                    <CartIcon className="h-4 w-4" />
                    {dict.nav.cart}
                    {count > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium text-ivory">
                        {count}
                      </span>
                    )}
                  </button>
                </div>

                {canBecomePro && (
                  <Link
                    href="/pro/inscription"
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-amethyst-400/40 bg-amethyst-500/10 text-[11px] font-medium uppercase tracking-[0.14em] text-amethyst-600 transition-colors active:bg-amethyst-500/20"
                  >
                    <Gem className="h-3.5 w-3.5" />
                    {dict.pro.becomeProBadge}
                  </Link>
                )}

                {isApprovedPro && (
                  <Link
                    href="/pro/boutique"
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 text-[11px] font-medium uppercase tracking-[0.14em] text-gold transition-colors active:bg-gold/20"
                  >
                    <Gem className="h-3.5 w-3.5" />
                    {dict.pro.viewCatalog}
                  </Link>
                )}

                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center justify-center rounded-xl border border-gold/40 text-[11px] uppercase tracking-[0.14em] text-gold transition-colors active:bg-gold/10"
                  >
                    {dict.nav.admin}
                  </Link>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <LanguageSwitcher className="min-h-12 flex-1 justify-center rounded-xl" />
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-ink/12 text-[11px] uppercase tracking-[0.14em] text-ink/60 transition-colors active:bg-ink/[0.05]"
                    >
                      {dict.nav.logout}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Affordance on the mobile menu rows so they read as tappable, not as prose. */
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
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
