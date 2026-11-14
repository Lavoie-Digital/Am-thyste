import type { Partner, Product, Settings } from "../types";

const now = 1_700_000_000_000;

/**
 * Seed catalog used as a fallback when Firestore isn't configured (placeholder
 * keys) and as the initial dataset to import into Firestore. Prices in cents CAD.
 * The owner edits all of this from the dashboard once Firebase is wired.
 */
export const SEED_PRODUCTS: Product[] = [
  {
    id: "hair-botox",
    slug: "hair-botox",
    active: true,
    name: { fr: "Hair Botox", en: "Hair Botox" },
    shortDesc: {
      fr: "Traitement capillaire professionnel à la kératine et à l'extrait de bambou. Usage professionnel seulement.",
      en: "Professional hair treatment with keratin and bamboo extract. Professional use only.",
    },
    description: {
      fr: "Traitement capillaire professionnel enrichi en kératine et en extrait de bambou, pour cheveux fins, ondulés, abîmés ou frisés. Appliqué en salon, il aide à discipliner les frisottis et laisse les cheveux plus doux et plus brillants. Réservé aux professionnels de la beauté dont le compte a été approuvé.",
      en: "Professional hair treatment enriched with keratin and bamboo extract, for fine, wavy, damaged or frizzy hair. Applied in the salon, it helps tame frizz and leaves hair softer and shinier. Reserved for beauty professionals whose account has been approved.",
    },
    ritual: {
      fr: "Usage professionnel seulement. Appliquer en salon sur cheveux propres et essorés, mèche par mèche, selon le protocole fourni avec le produit. Laisser poser 20 à 40 minutes, puis rincer abondamment.",
      en: "Professional use only. Apply in the salon to clean, towel-dried hair, section by section, following the protocol supplied with the product. Leave on for 20 to 40 minutes, then rinse thoroughly.",
    },
    ingredients: {
      fr: "Kératine, extrait de bambou, huiles végétales. Liste complète des ingrédients sur l'emballage.",
      en: "Keratin, bamboo extract, plant oils. Full ingredient list on the packaging.",
    },
    marketPrice: 4999,
    resellerPrice: 2999,
    proOnly: true,
    currency: "cad",
    images: ["/démo.jpeg", "/présentation.jpeg", "/description.jpeg"],
    sizes: [
      { id: "500g", label: { fr: "500 g / 17,6 oz", en: "500 g / 17.6 oz" } },
    ],
    category: "mask",
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "huile-prestige",
    slug: "huile-prestige",
    active: true,
    name: { fr: "Huile Prestige", en: "Huile Prestige" },
    shortDesc: {
      fr: "Huile de finition pour les longueurs et les pointes. Brillance sans effet gras.",
      en: "Finishing oil for lengths and ends. Shine without a greasy feel.",
    },
    description: {
      fr: "Quelques gouttes suffisent pour discipliner les pointes et apporter une finition lumineuse. L'Huile Prestige laisse les cheveux doux, soyeux et brillants.",
      en: "A few drops are enough to tame the ends and add a luminous finish. Huile Prestige leaves hair soft, silky and shiny.",
    },
    ritual: {
      fr: "Chauffer une à deux gouttes entre les paumes et appliquer sur les longueurs et les pointes, sur cheveux humides ou secs.",
      en: "Warm one to two drops between the palms and apply to lengths and ends, on damp or dry hair.",
    },
    ingredients: {
      fr: "Complexe d'huiles végétales. Liste complète des ingrédients sur l'emballage.",
      en: "Plant oil complex. Full ingredient list on the packaging.",
    },
    marketPrice: 3499,
    resellerPrice: 1999,
    currency: "cad",
    images: ["/présentation.jpeg", "/femme.jpeg"],
    sizes: [{ id: "50ml", label: { fr: "50 ml / 1,69 oz", en: "50 ml / 1.69 oz" } }],
    category: "serum",
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "shampoing-lissant",
    slug: "shampoing-lissant",
    active: true,
    name: { fr: "Shampoing Lissant", en: "Smoothing Shampoo" },
    shortDesc: {
      fr: "Nettoie en douceur et laisse les cheveux plus lisses. Kératine et extrait de bambou.",
      en: "Gently cleanses and leaves hair smoother. Keratin and bamboo extract.",
    },
    description: {
      fr: "Un shampoing lissant pour tous types de cheveux. Sa formule à la kératine et à l'extrait de bambou nettoie en douceur et laisse les cheveux plus lisses et plus brillants. Le premier geste de la routine Améthyste à la maison.",
      en: "A smoothing shampoo for all hair types. Its keratin and bamboo extract formula gently cleanses and leaves hair smoother and shinier. The first step of the Améthyste at-home routine.",
    },
    ingredients: {
      fr: "Kératine, extrait de bambou. Tous types de cheveux. Liste complète des ingrédients sur l'emballage.",
      en: "Keratin, bamboo extract. For all hair types. Full ingredient list on the packaging.",
    },
    marketPrice: 2799,
    resellerPrice: 1699,
    currency: "cad",
    images: ["/shampoing.jpeg"],
    sizes: [{ id: "300ml", label: { fr: "300 ml / 10,4 oz", en: "300 ml / 10.4 oz" } }],
    category: "shampoo",
    sortOrder: 3,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "revitalisant-lissant",
    slug: "revitalisant-lissant",
    active: true,
    name: { fr: "Revitalisant Lissant", en: "Smoothing Conditioner" },
    shortDesc: {
      fr: "Démêle, adoucit et lisse. Le complément du Shampoing Lissant.",
      en: "Detangles, softens and smooths. The companion to the Smoothing Shampoo.",
    },
    description: {
      fr: "Ce revitalisant lissant à la kératine et à l'extrait de bambou facilite le démêlage et laisse les cheveux doux, lisses et faciles à coiffer.",
      en: "This smoothing conditioner with keratin and bamboo extract makes detangling easier and leaves hair soft, smooth and easy to style.",
    },
    ingredients: {
      fr: "Kératine, extrait de bambou. Tous types de cheveux. Liste complète des ingrédients sur l'emballage.",
      en: "Keratin, bamboo extract. For all hair types. Full ingredient list on the packaging.",
    },
    marketPrice: 2799,
    resellerPrice: 1699,
    currency: "cad",
    images: ["/shampoing.jpeg"],
    sizes: [{ id: "300ml", label: { fr: "300 ml / 10,4 oz", en: "300 ml / 10.4 oz" } }],
    category: "conditioner",
    sortOrder: 4,
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * Landing-page partners shown when Firestore isn't configured, and the initial
 * dataset to import into the `partners` collection. Mirrors what used to be
 * hard-coded on the home page.
 */
export const SEED_PARTNERS: Partner[] = [
  {
    id: "bella-extensions",
    name: "Bella Extensions",
    logo: "/bella-extensions-logo.avif",
    href: "https://www.bellaextensions.ca/accueil",
    role: { fr: "Salon certifié · Distributrice", en: "Certified salon · Distributor" },
    desc: {
      fr: "Un savoir-faire Améthyste en cabine et la distribution au Nouveau-Brunswick.",
      en: "Améthyste expertise in the chair, and distribution across New Brunswick.",
    },
    cta: { fr: "Visiter le salon", en: "Visit the salon" },
    active: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
];

export const SEED_SETTINGS: Settings = {
  freeShippingThreshold: 10000,
  flatShippingRate: 1500,
  contactEmail: "info@amethystehairproductscanada.ca",
  social: {
    instagram: "https://instagram.com/amethystehairproducts",
    facebook: "https://www.facebook.com/AmethysteHairProducts",
  },
  banner: {
    fr: "Livraison gratuite dès 100 $ · Marque québécoise",
    en: "Free shipping over $100 · A Québec brand",
  },
};
