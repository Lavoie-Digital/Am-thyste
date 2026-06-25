import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2.5 rounded-full text-xs uppercase tracking-[0.18em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Deep ink on ivory — the quiet, confident primary. Explicit values so the
  // fill never depends on a theme variable resolving.
  primary: "bg-[#211a2c] text-[#faf7f2] hover:bg-[#382c42]",
  secondary: "border border-[#211a2c]/15 text-[#211a2c] hover:border-[#211a2c]/40 hover:bg-[#211a2c]/[0.03]",
  ghost: "text-[#4b4357] hover:text-[#211a2c]",
  gold: "bg-[#9c7c43] text-[#faf7f2] hover:bg-[#b08f57]",
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
