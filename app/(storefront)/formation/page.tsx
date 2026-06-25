import type { Metadata } from "next";
import { FormationView, type FormationContent } from "@/components/storefront/FormationView";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Formation" };

const CONTENT: Record<"fr" | "en", FormationContent> = {
  fr: {
    eyebrow: "Pour les professionnels",
    title: "La formation",
    subtitle: "Faites du rituel botox votre signature d'excellence",
    intro: [
      "Depuis plusieurs années, Améthyste se spécialise dans la formation de professionnels. Présentiel, écoles ou classes virtuelles : nous nous adaptons à vos besoins et à vos disponibilités.",
      "Notre objectif principal est de vous transmettre notre savoir afin que vous puissiez exceller dans le rituel botox — jusqu'à en faire votre propre signature d'excellence.",
    ],
    formatsLabel: "Nos formats",
    formats: [
      { kind: "presentiel", t: "En présentiel", d: "Une formation pratique, en personne, adaptée à votre salon." },
      { kind: "ecole", t: "En écoles", d: "Des sessions dispensées directement au sein des écoles." },
      { kind: "virtuel", t: "En classe virtuelle", d: "À distance, selon vos besoins et vos disponibilités." },
    ],
    webinarBadge: "Nouveau · Février 2026",
    webinarTitle: "Des webinaires hebdomadaires",
    webinarDesc:
      "Dès février 2026, des webinaires hebdomadaires permettront aux coiffeurs et coiffeuses déjà expérimentés dans le rituel de se perfectionner et d'élever leurs services.",
    ctaTitle: "Inscrivez-vous",
    ctaDesc: "Communiquez avec nous pour réserver votre place ou en savoir plus sur nos prochaines formations.",
    ctaPrimary: "Nous contacter",
    ctaSecondary: "Espace pro",
    imageAlt: "Formation Améthyste",
  },
  en: {
    eyebrow: "For professionals",
    title: "Training",
    subtitle: "Make the botox ritual your signature of excellence",
    intro: [
      "For several years, Améthyste has specialized in training professionals. In-person, in schools, or in virtual classrooms — we adapt to your needs and your availability.",
      "Our main goal is to pass on our knowledge so you can excel in the botox ritual — until it becomes your very own signature of excellence.",
    ],
    formatsLabel: "Our formats",
    formats: [
      { kind: "presentiel", t: "In person", d: "Hands-on training, in person, tailored to your salon." },
      { kind: "ecole", t: "In schools", d: "Sessions delivered directly within schools." },
      { kind: "virtuel", t: "Virtual classroom", d: "Remotely, to fit your needs and your schedule." },
    ],
    webinarBadge: "New · February 2026",
    webinarTitle: "Weekly webinars",
    webinarDesc:
      "Starting February 2026, weekly webinars will help stylists already experienced with the ritual refine their craft and elevate their services.",
    ctaTitle: "Sign up",
    ctaDesc: "Get in touch to reserve your spot or learn more about our upcoming sessions.",
    ctaPrimary: "Contact us",
    ctaSecondary: "Pro space",
    imageAlt: "Améthyste training",
  },
};

export default async function FormationPage() {
  const locale = await getLocale();
  return <FormationView c={CONTENT[locale]} />;
}
