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

/** Line-art amethyst crystal — the brand logomark. */
export function Gem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={cn("h-10 w-auto", className)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M24 3 36 18 30 58 18 58 12 18 24 3Z" />
      <path d="M12 18h24" />
      <path d="M24 3 18 18l6 40 6-40-6-15Z" />
    </svg>
  );
}

export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 21c0-7 4-13 14-15 0 9-5 14-11 14-1.5 0-3-.4-3-.4Z" />
      <path d="M9 18c2-4 4-6 8-8" />
    </svg>
  );
}

export function Flask({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

export function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-6 w-6", className)} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20s-7-4.6-9.2-9C1.3 8 2.6 5 5.6 5c1.9 0 3.2 1.2 4.4 2.6C11.2 6.2 12.5 5 14.4 5c3 0 4.3 3 2.8 6-2.2 4.4-9.2 9-9.2 9Z" transform="translate(0 -0.5)" />
    </svg>
  );
}

export function Search({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** Centered hairline divider with a small mark, for section breaks. */
export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden>
      <span className="h-px w-12 bg-ink/12" />
      <Mark className="h-2.5 w-2.5 text-amethyst-500/70" />
      <span className="h-px w-12 bg-ink/12" />
    </div>
  );
}
