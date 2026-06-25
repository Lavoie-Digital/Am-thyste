import { Container } from "@/components/ui/Container";
import { Mark } from "@/components/ui/icons";

/** Centered glass card shell for auth screens, on the amethyst night background. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100svh] items-center justify-center py-32">
      <Container className="max-w-md">
        <div className="surface rounded-2xl p-8 sm:p-10">
          <div className="mb-8 text-center">
            <Mark className="mx-auto text-gold/80" />
            <h1 className="mt-4 heading text-3xl">{title}</h1>
            {subtitle && <p className="mt-3 text-sm leading-relaxed text-ink/55">{subtitle}</p>}
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-ink-mute">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/45">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "h-12 w-full rounded-xl border border-ink/10 bg-bone/70 px-4 text-ink placeholder:text-ink/35 transition-colors focus:border-ink/15";
