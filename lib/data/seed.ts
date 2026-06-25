import type { Product, Settings } from "../types";

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
      fr: "Le soin signature. Réparation intense pour cheveux fins, ondulés, abîmés ou frisés.",
      en: "The signature treatment. Intense repair for fine, wavy, damaged or frizzy hair.",
    },
    description: {
      fr: "Notre masque Hair Botox reconstruit la fibre capillaire en profondeur. Enrichi en kératine et en actifs nourrissants, il discipline les frisottis, ravive la brillance et redonne souplesse et vitalité dès la première application. Un véritable rituel de transformation à domicile comme en salon.",
      en: "Our Hair Botox mask rebuilds the hair fiber from within. Enriched with keratin and nourishing actives, it tames frizz, revives shine and restores softness and vitality from the very first use. A true transformation ritual, at home or in the salon.",
    },
    ritual: {
      fr: "Appliquer sur cheveux propres et essorés, mèche par mèche. Laisser poser 20 à 40 minutes, puis rincer abondamment. Utiliser une fois par semaine pour des résultats durables.",
      en: "Apply to clean, towel-dried hair, section by section. Leave on for 20 to 40 minutes, then rinse thoroughly. Use once a week for lasting results.",
    },
    ingredients: {
      fr: "Kératine, extrait de bambou, huiles végétales nourrissantes, complexe réparateur.",
      en: "Keratin, bamboo extract, nourishing plant oils, repair complex.",
    },
    marketPrice: 4999,
    resellerPrice: 2999,
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
      fr: "Sérum sublimateur. Brillance miroir et protection thermique, sans effet gras.",
      en: "Finishing serum. Mirror shine and heat protection, without a greasy feel.",
    },
    description: {
      fr: "Quelques gouttes suffisent pour sceller l'hydratation, dompter les pointes et offrir une finition lumineuse. L'Huile Prestige protège la fibre de la chaleur et révèle un éclat soyeux digne des plus beaux rituels.",
      en: "A few drops are enough to seal in hydration, tame the ends and deliver a luminous finish. Huile Prestige protects the fiber from heat and reveals a silky radiance worthy of the finest rituals.",
    },
    ritual: {
      fr: "Chauffer une à deux gouttes entre les paumes et appliquer sur les longueurs et pointes, cheveux humides ou secs.",
      en: "Warm one to two drops between the palms and apply to lengths and ends, on damp or dry hair.",
    },
    ingredients: {
      fr: "Complexe d'huiles précieuses, agents de brillance, protection thermo-active.",
      en: "Precious oil complex, shine agents, heat-active protection.",
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
      fr: "Nettoie en douceur tout en lissant. Kératine & extrait de bambou.",
      en: "Gently cleanses while smoothing. Keratin & bamboo extract.",
    },
    description: {
      fr: "Un shampoing lissant pour tous types de cheveux. Sa formule à la kératine et à l'extrait de bambou répare, lisse et fait briller, jour après jour. Le premier geste du rituel Améthyste.",
      en: "A smoothing shampoo for all hair types. Its keratin and bamboo extract formula repairs, smooths and adds shine, day after day. The first step of the Améthyste ritual.",
    },
    ingredients: {
      fr: "Kératine, extrait de bambou. Tous types de cheveux.",
      en: "Keratin, bamboo extract. For all hair types.",
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
      fr: "Démêle, nourrit et lisse. Le duo parfait du shampoing.",
      en: "Detangles, nourishes and smooths. The perfect pair to the shampoo.",
    },
    description: {
      fr: "Ce revitalisant lissant enveloppe la fibre d'une nutrition profonde. Kératine et extrait de bambou réparent, lissent et subliment la brillance pour des cheveux soyeux et faciles à coiffer.",
      en: "This smoothing conditioner wraps the fiber in deep nutrition. Keratin and bamboo extract repair, smooth and enhance shine for silky, easy-to-style hair.",
    },
    ingredients: {
      fr: "Kératine, extrait de bambou. Tous types de cheveux.",
      en: "Keratin, bamboo extract. For all hair types.",
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

export const SEED_SETTINGS: Settings = {
  freeShippingThreshold: 10000,
  flatShippingRate: 1500,
  contactEmail: "info@amethystehairproducts.com",
  social: {
    instagram: "https://instagram.com/amethystehairproducts",
    facebook: "https://facebook.com/amethystehairproducts",
  },
  banner: {
    fr: "Livraison gratuite dès 100 $ · Fièrement canadien",
    en: "Free shipping over $100 · Proudly Canadian",
  },
};
