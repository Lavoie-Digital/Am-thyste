"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const { dict } = useLocale();
  const pathname = usePathname();

  const links = [
    { href: "/tableau-de-bord", label: dict.dashboard.title, exact: true },
    { href: "/tableau-de-bord/produits", label: dict.dashboard.products },
    { href: "/tableau-de-bord/commandes", label: dict.dashboard.orders },
    { href: "/admin/pros", label: dict.admin.pros },
    { href: "/tableau-de-bord/parametres", label: dict.dashboard.settings },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-amethyst-300/15 lg:h-[100svh] lg:w-72 lg:border-r lg:p-6">
      <Link href="/" className="mb-6 flex items-center gap-3 px-2">
        <span className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-amethyst-300/30">
          <Image src="/logo.jpeg" alt="Améthyste" fill sizes="40px" className="object-cover" />
        </span>
        <span className="font-display text-sm tracking-[0.2em] text-amethyst-50">AMÉTHYSTE</span>
      </Link>

      <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors",
                active
                  ? "bg-amethyst-500/20 text-white ring-1 ring-amethyst-300/30"
                  : "text-amethyst-100/70 hover:bg-white/5 hover:text-white",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden pt-6 lg:block">
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}
