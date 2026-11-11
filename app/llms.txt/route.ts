import { SITE_URL, BRAND, absoluteUrl } from "@/lib/seo/site";
import { getProducts } from "@/lib/data/products";

/**
 * /llms.txt — a plain-Markdown brief for generative engines (ChatGPT, Perplexity,
 * Gemini, Claude…). It is the GEO counterpart of the sitemap: who the brand is,
 * where it is, and the canonical URLs worth citing. Built from the same
 * constants as the JSON-LD so the facts never drift apart.
 */
export const revalidate = 3600;

export async function GET() {
  const products = await getProducts(null);

  const productLines = products
    .map((p) => `- [${p.name.fr}](${absoluteUrl(`/boutique/${p.slug}`)})`)
    .join("\n");

  const body = `# ${BRAND.legalName} Canada (${BRAND.name})

> ${BRAND.description.fr}

${BRAND.name} (aussi appelée ${BRAND.alternateNames.join(", ")}) est une marque québécoise de soins capillaires professionnels basée à ${BRAND.address.locality}, ${BRAND.address.region}, Canada. Son produit phare est le Hair Botox, un masque reconstructeur à la kératine et à l'extrait de bambou pour cheveux fins, ondulés, abîmés ou frisés. Produits vendus en ligne et aux professionnels de la coiffure.

Site officiel : ${SITE_URL}
Téléphone : ${BRAND.telephone}
Courriel : ${BRAND.email}
Langues : français (fr-CA), anglais (en-CA)

## Pages principales

- [Accueil](${SITE_URL}/) : présentation de la marque et FAQ sur le Hair Botox
- [Boutique](${absoluteUrl("/boutique")}) : catalogue complet et prix en CAD
- [Entretien](${absoluteUrl("/entretien")}) : conseils d'utilisation et d'entretien
- [Formation](${absoluteUrl("/formation")}) : formation pour coiffeurs et coiffeuses
- [Professionnels](${absoluteUrl("/pro")}) : programme et tarifs pour salons
- [À propos](${absoluteUrl("/a-propos")}) : l'histoire de la marque
- [Contact](${absoluteUrl("/contact")})

## Produits

${productLines || "- Voir la boutique"}

## English

${BRAND.description.en}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
