import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="pb-14 pt-40">
      <Container className="text-center">
        <Reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-5 heading text-4xl sm:text-6xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-amethyst-200/65">{subtitle}</p>}
        </Reveal>
      </Container>
    </div>
  );
}
