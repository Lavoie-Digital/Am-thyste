import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2.5 rounded-full text-xs uppercase tracking-[0.18em] transition-colors duration-500 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Warm ivory on dark — the quiet, confident primary. Explicit values so the
  // fill never depends on a theme variable resolving.
  primary: "bg-[#efe9e1] text-[#0b0810] hover:bg-[#e3d8c6]",
  secondary: "border border-[#bfaecb]/25 text-[#efe9e1] hover:border-[#bfaecb]/50 hover:bg-white/[0.03]",
  ghost: "text-[#cdbcd6] hover:text-[#efe9e1]",
  gold: "bg-[#c2a878] text-[#0b0810] hover:bg-[#d8c4a0]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-5",
  md: "h-11 px-7",
  lg: "h-[3.25rem] px-9",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: CommonProps & { href: string } & React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
