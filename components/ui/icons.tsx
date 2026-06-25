import { cn } from "@/lib/utils";

/** Thin four-point mark — the brand's quiet accent (replaces emoji sparkles). */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-3 w-3", className)} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M12 2c.4 4.8 1.2 5.6 6 6-4.8.4-5.6 1.2-6 6-.4-4.8-1.2-5.6-6-6 4.8-.4 5.6-1.2 6-6Z" />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** Centered hairline divider with a small mark, for section breaks. */
export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden>
      <span className="h-px w-12 bg-amethyst-400/30" />
      <Mark className="h-2.5 w-2.5 text-amethyst-400/70" />
      <span className="h-px w-12 bg-amethyst-400/30" />
    </div>
  );
}
