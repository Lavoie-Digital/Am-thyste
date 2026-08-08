import type { Metadata } from "next";
import { PageHeader } from "@/components/storefront/PageHeader";
import { Container } from "@/components/ui/Container";
import { getLocale } from "@/lib/i18n/server";

/* ─────────────────────────────────────────────────────────────────────────
   À TENIR À JOUR — ces valeurs sont exigées ou fortement recommandées par la
   Loi 25 (Loi sur la protection des renseignements personnels dans le secteur
   privé, RLRQ c. P-39.1).

   • PRIVACY_OFFICER : l'art. 3.1 impose de PUBLIER le titre et les coordonnées
     du responsable de la protection des renseignements personnels. Le nom
     n'est pas obligatoire, mais il inspire confiance : remplissez `name` dès
     que la cliente a désigné la personne.
   • LAST_UPDATED : doit refléter la dernière modification réelle du texte.
   ──────────────────────────────────────────────────────────────────────── */
const LAST_UPDATED = "2026-08-08";

const PRIVACY_OFFICER = {
  /** Laisser vide tant que la personne n'est pas désignée officiellement. */
  name: "",
  email: "info@amethystehairproductscanada.ca",
};

const CAI = { site: "cai.gouv.qc.ca", url: "https://www.cai.gouv.qc.ca", phone: "1 888 528-7741" };

/* ── Contenu ─────────────────────────────────────────────────────────────── */

type Table = { head: string[]; rows: string[][] };
type Block = string | { list: string[] } | { table: Table };
type Section = { id: string; heading: string; body: Block[] };

type Content = {
  subtitle: string;
  updatedLabel: string;
  summaryTitle: string;
  summary: string[];
  tocTitle: string;
  sections: Section[];
  contact: { title: string; role: string; intro: string; subjectHint: string };
};

const CONTENT: Record<"fr" | "en", Content> = {
  fr: {
    subtitle:
      "Ce que nous recueillons, pourquoi, avec qui c'est partagé et comment exercer vos droits — conformément à la Loi 25 du Québec.",
    updatedLabel: "Dernière mise à jour",
    summaryTitle: "En bref",
    summary: [
      "Vos renseignements ne sont jamais vendus, loués ni échangés.",
      "Aucun témoin publicitaire, aucun traceur, aucun profilage.",
      "Vos numéros de carte ne transitent jamais par nos serveurs.",
      "Accès, correction, suppression et portabilité : sur simple demande.",
    ],
    tocTitle: "Sommaire",
    sections: [
      {
        id: "responsable",
        heading: "Responsable de la protection des renseignements personnels",
        body: [
          "Améthyste exploite la boutique en ligne amethystehairproductscanada.ca et est responsable des renseignements personnels qu'elle y recueille.",
          "Conformément à l'article 3.1 de la Loi 25, la personne ayant la plus haute autorité au sein d'Améthyste assume la fonction de responsable de la protection des renseignements personnels. Elle veille à l'application de la présente politique et traite toute demande d'accès, de rectification ou de plainte. Ses coordonnées figurent au bas de cette page.",
        ],
      },
      {
        id: "collecte",
        heading: "Renseignements que nous recueillons",
        body: [
          "Nous ne recueillons que ce qui est nécessaire aux fins décrites à la section suivante.",
          {
            table: {
              head: ["Contexte", "Renseignements recueillis"],
              rows: [
                [
                  "Commande",
                  "Nom, adresse courriel, adresse de livraison et de facturation, contenu et montant de la commande.",
                ],
                [
                  "Compte client",
                  "Adresse courriel, nom d'affichage. Le mot de passe est géré et chiffré par Firebase Authentication : nous n'y avons jamais accès.",
                ],
                [
                  "Demande de compte professionnel",
                  "Nom de l'entreprise, numéro de téléphone, adresse, et une pièce justificative (diplôme ou attestation) servant uniquement à vérifier votre statut de professionnel.",
                ],
                ["Formulaire de contact", "Nom, adresse courriel et contenu de votre message."],
                [
                  "Paiement",
                  "Les données de votre carte sont saisies dans un champ sécurisé fourni par Square et transmises directement à Square. Nous n'en conservons que l'identifiant de transaction, le montant et le statut.",
                ],
              ],
            },
          },
          "Nous ne recueillons aucune donnée de santé, biométrique ou de géolocalisation, et nous ne demandons jamais votre numéro d'assurance sociale.",
        ],
      },
      {
        id: "finalites",
        heading: "Pourquoi nous les recueillons",
        body: [
          {
            list: [
              "Traiter, expédier et suivre vos commandes.",
              "Émettre les factures et respecter nos obligations comptables et fiscales.",
              "Vérifier l'admissibilité d'une demande de compte professionnel et donner accès aux tarifs correspondants.",
              "Répondre à vos questions et vous transmettre les courriels liés à votre commande ou à votre compte.",
              "Assurer la sécurité du site, authentifier les connexions et prévenir la fraude.",
            ],
          },
          "Nous n'utilisons vos renseignements à aucune autre fin. Nous ne vous envoyons pas d'infolettre et n'utilisons pas vos coordonnées à des fins publicitaires. Si une nouvelle finalité devait s'ajouter, nous vous en informerions et obtiendrions votre consentement au préalable.",
        ],
      },
      {
        id: "consentement",
        heading: "Consentement",
        body: [
          "Votre consentement est demandé de manière libre et éclairée, pour des fins précises. Les renseignements liés à une commande sont, quant à eux, nécessaires à la conclusion et à l'exécution du contrat de vente.",
          "Vous pouvez retirer votre consentement en tout temps en écrivant au responsable. Selon le renseignement visé, cela peut nous empêcher de traiter une commande en cours ou de maintenir votre compte : nous vous l'expliquerons avant d'agir.",
          "Conformément à l'article 9.1 de la Loi 25, les paramètres de confidentialité du site sont réglés par défaut au niveau le plus élevé. Aucun suivi n'est activé et aucun réglage n'est requis de votre part.",
        ],
      },
      {
        id: "paiements",
        heading: "Paiements",
        body: [
          "Les paiements sont traités par Square, un fournisseur certifié PCI-DSS qui agit comme sous-traitant de paiement. Le formulaire de carte affiché à l'étape du paiement est hébergé par Square dans un cadre isolé : les numéros de carte ne touchent jamais nos serveurs et ne sont jamais enregistrés par nous.",
        ],
      },
      {
        id: "temoins",
        heading: "Témoins (cookies) et stockage local",
        body: [
          "Le site n'utilise que deux témoins, tous deux strictement nécessaires à son fonctionnement.",
          {
            table: {
              head: ["Témoin", "Rôle", "Durée"],
              rows: [
                [
                  "session",
                  "Maintient votre connexion à votre compte. Témoin HttpOnly et chiffré, émis par Firebase, illisible par les scripts du navigateur.",
                  "5 jours",
                ],
                [
                  "amethyste_locale",
                  "Mémorise votre choix de langue (français ou anglais).",
                  "12 mois",
                ],
              ],
            },
          },
          "Aucun témoin publicitaire, aucun outil de mesure d'audience, aucun traceur tiers et aucun profilage ne sont utilisés sur ce site.",
          "Votre panier n'est enregistré nulle part : il reste en mémoire le temps de votre visite et se réinitialise dès que vous rafraîchissez ou quittez la page. Aucun autre renseignement n'est conservé dans votre navigateur.",
          "Vous pouvez supprimer ces témoins depuis les réglages de votre navigateur. Supprimer le témoin de session vous déconnecte simplement de votre compte.",
        ],
      },
      {
        id: "fournisseurs",
        heading: "Fournisseurs et communication hors Québec",
        body: [
          "Nous faisons appel à un nombre restreint de fournisseurs, qui traitent les renseignements uniquement pour notre compte et selon nos instructions. Certains hébergent leurs infrastructures à l'extérieur du Québec.",
          {
            table: {
              head: ["Fournisseur", "Rôle", "Traitement"],
              rows: [
                ["Square", "Traitement des paiements par carte", "Canada, États-Unis"],
                [
                  "Google (Firebase)",
                  "Authentification, base de données et stockage des fichiers téléversés",
                  "États-Unis",
                ],
                [
                  "Twilio SendGrid",
                  "Envoi des courriels transactionnels (confirmations, réponses)",
                  "États-Unis",
                ],
              ],
            },
          },
          "Conformément à l'article 17 de la Loi 25, nous évaluons, avant de confier des renseignements à un fournisseur situé hors du Québec, si ceux-ci y bénéficieront d'une protection adéquate au regard des principes de protection généralement reconnus. Chaque fournisseur est lié par contrat à des obligations de confidentialité et de sécurité.",
          "En dehors de ces fournisseurs, nous ne communiquons vos renseignements à aucun tiers, sauf si la loi nous y oblige ou si vous nous le demandez expressément.",
        ],
      },
      {
        id: "conservation",
        heading: "Conservation et destruction",
        body: [
          "Nous conservons vos renseignements uniquement le temps nécessaire aux fins pour lesquelles ils ont été recueillis. Passé ce délai, ils sont détruits ou anonymisés.",
          {
            table: {
              head: ["Renseignements", "Durée de conservation"],
              rows: [
                [
                  "Commandes, factures et pièces comptables",
                  "6 ans suivant la fin de l'exercice financier concerné, tel que l'exigent les autorités fiscales.",
                ],
                [
                  "Compte client ou professionnel",
                  "Tant que le compte existe. Supprimé sur demande, sous réserve des pièces comptables ci-dessus.",
                ],
                [
                  "Pièce justificative professionnelle",
                  "Le temps que le statut professionnel demeure actif, puis détruite.",
                ],
                [
                  "Messages du formulaire de contact",
                  "Ils ne sont pas enregistrés dans notre base de données : ils nous parviennent par courriel et sont conservés au plus 24 mois.",
                ],
                ["Témoins", "Voir les durées indiquées à la section 6."],
              ],
            },
          },
        ],
      },
      {
        id: "securite",
        heading: "Sécurité et incidents de confidentialité",
        body: [
          "Le site est servi exclusivement en HTTPS. Les sessions reposent sur un témoin HttpOnly chiffré, l'accès aux données est restreint par rôle et vérifié côté serveur à chaque requête, et aucune donnée de carte de crédit n'est stockée par nous.",
          "Nous tenons un registre des incidents de confidentialité. En cas d'incident présentant un risque qu'un préjudice sérieux vous soit causé, nous en aviserons sans délai la Commission d'accès à l'information ainsi que les personnes concernées, comme l'exige la Loi 25.",
        ],
      },
      {
        id: "droits",
        heading: "Vos droits",
        body: [
          "La Loi 25 vous reconnaît les droits suivants sur vos renseignements personnels :",
          {
            list: [
              "Accès — obtenir la communication des renseignements que nous détenons sur vous.",
              "Rectification — faire corriger un renseignement inexact, incomplet ou équivoque.",
              "Suppression — faire supprimer votre compte et les renseignements dont la conservation n'est plus nécessaire.",
              "Retrait du consentement — mettre fin en tout temps à un traitement fondé sur votre consentement.",
              "Portabilité — recevoir, dans un format technologique structuré et couramment utilisé, les renseignements informatisés que vous nous avez fournis, ou en demander la communication à un tiers.",
              "Désindexation et cessation de diffusion — demander que cesse la diffusion d'un renseignement vous concernant ou que soit désindexé tout hyperlien y donnant accès, aux conditions prévues par la loi.",
            ],
          },
          "Pour exercer l'un de ces droits, écrivez au responsable de la protection des renseignements personnels. Nous répondons dans les 30 jours suivant la réception de votre demande. Le traitement de votre demande est gratuit; si des frais raisonnables de transcription ou de reproduction devaient s'appliquer, nous vous en informerions avant d'y donner suite.",
        ],
      },
      {
        id: "automatise",
        heading: "Décisions automatisées et profilage",
        body: [
          "Aucune décision vous concernant n'est prise de façon exclusivement automatisée. L'approbation d'une demande de compte professionnel est examinée par une personne. Nous n'effectuons aucun profilage et n'utilisons aucune technologie d'identification, de localisation ou de suivi.",
        ],
      },
      {
        id: "mineurs",
        heading: "Renseignements concernant les mineurs",
        body: [
          "Notre boutique s'adresse à une clientèle adulte. Nous ne recueillons pas sciemment de renseignements concernant une personne de moins de 14 ans sans le consentement du titulaire de l'autorité parentale. Si vous croyez que de tels renseignements nous ont été transmis, écrivez-nous et nous les supprimerons.",
        ],
      },
      {
        id: "plainte",
        heading: "Plainte",
        body: [
          `Si le traitement de votre demande ne vous satisfait pas, vous pouvez porter plainte auprès de la Commission d'accès à l'information du Québec : ${CAI.site} ou ${CAI.phone}.`,
        ],
      },
      {
        id: "modifications",
        heading: "Modifications de la politique",
        body: [
          "Toute modification est publiée sur cette page et la date de mise à jour est ajustée en conséquence. Si un changement devait modifier de façon importante la manière dont nous traitons vos renseignements, nous vous en informerions avant qu'il ne prenne effet.",
        ],
      },
    ],
    contact: {
      title: "Exercer vos droits",
      role: "Responsable de la protection des renseignements personnels",
      intro:
        "Pour une demande d'accès, de rectification, de suppression ou de portabilité, ou pour toute question sur cette politique :",
      subjectHint: "Objet suggéré : « Protection des renseignements personnels »",
    },
  },

  en: {
    subtitle:
      "What we collect, why, who it is shared with, and how to exercise your rights — in accordance with Quebec's Law 25.",
    updatedLabel: "Last updated",
    summaryTitle: "In short",
    summary: [
      "Your information is never sold, rented or traded.",
      "No advertising cookies, no trackers, no profiling.",
      "Your card numbers never pass through our servers.",
      "Access, correction, deletion and portability: on request.",
    ],
    tocTitle: "Contents",
    sections: [
      {
        id: "responsable",
        heading: "Privacy officer",
        body: [
          "Améthyste operates the online store at amethystehairproductscanada.ca and is responsible for the personal information collected there.",
          "In accordance with section 3.1 of Law 25, the person with the highest authority within Améthyste acts as the person in charge of the protection of personal information. They oversee the application of this policy and handle any access request, correction request or complaint. Their contact details appear at the bottom of this page.",
        ],
      },
      {
        id: "collecte",
        heading: "Information we collect",
        body: [
          "We collect only what is necessary for the purposes described in the next section.",
          {
            table: {
              head: ["Context", "Information collected"],
              rows: [
                [
                  "Order",
                  "Name, email address, shipping and billing address, order contents and amount.",
                ],
                [
                  "Customer account",
                  "Email address and display name. Your password is managed and encrypted by Firebase Authentication: we never have access to it.",
                ],
                [
                  "Professional account request",
                  "Business name, phone number, address, and a supporting document (diploma or certificate) used solely to verify your professional status.",
                ],
                ["Contact form", "Your name, email address and the content of your message."],
                [
                  "Payment",
                  "Your card details are entered in a secure field provided by Square and sent directly to Square. We keep only the transaction identifier, the amount and the status.",
                ],
              ],
            },
          },
          "We collect no health, biometric or geolocation data, and we never ask for your social insurance number.",
        ],
      },
      {
        id: "finalites",
        heading: "Why we collect it",
        body: [
          {
            list: [
              "Process, ship and track your orders.",
              "Issue invoices and meet our accounting and tax obligations.",
              "Assess professional account requests and grant access to the corresponding pricing.",
              "Answer your questions and send you emails related to your order or account.",
              "Keep the site secure, authenticate sign-ins and prevent fraud.",
            ],
          },
          "We use your information for no other purpose. We send no newsletter and use your contact details for no advertising purpose. Should a new purpose arise, we would inform you and obtain your consent beforehand.",
        ],
      },
      {
        id: "consentement",
        heading: "Consent",
        body: [
          "Your consent is sought freely and on an informed basis, for specific purposes. Information tied to an order is, for its part, necessary to enter into and perform the sales contract.",
          "You may withdraw your consent at any time by writing to the privacy officer. Depending on the information concerned, this may prevent us from processing a pending order or maintaining your account: we will explain this to you before acting.",
          "In accordance with section 9.1 of Law 25, the site's privacy settings default to the highest level. No tracking is enabled and no configuration is required on your part.",
        ],
      },
      {
        id: "paiements",
        heading: "Payments",
        body: [
          "Payments are processed by Square, a PCI-DSS certified provider acting as our payment processor. The card form shown at checkout is hosted by Square in an isolated frame: card numbers never reach our servers and are never stored by us.",
        ],
      },
      {
        id: "temoins",
        heading: "Cookies and local storage",
        body: [
          "The site uses only two cookies, both strictly necessary for it to function.",
          {
            table: {
              head: ["Cookie", "Purpose", "Lifetime"],
              rows: [
                [
                  "session",
                  "Keeps you signed in to your account. An encrypted HttpOnly cookie issued by Firebase, unreadable by browser scripts.",
                  "5 days",
                ],
                ["amethyste_locale", "Remembers your language choice (French or English).", "12 months"],
              ],
            },
          },
          "No advertising cookies, no analytics tools, no third-party trackers and no profiling are used on this site.",
          "Your cart is not saved anywhere: it stays in memory for the duration of your visit and resets as soon as you refresh or leave the page. No other information is kept in your browser.",
          "You can delete these cookies from your browser settings. Deleting the session cookie simply signs you out of your account.",
        ],
      },
      {
        id: "fournisseurs",
        heading: "Providers and processing outside Quebec",
        body: [
          "We rely on a small number of providers, which process information solely on our behalf and under our instructions. Some host their infrastructure outside Quebec.",
          {
            table: {
              head: ["Provider", "Role", "Processing"],
              rows: [
                ["Square", "Card payment processing", "Canada, United States"],
                [
                  "Google (Firebase)",
                  "Authentication, database and storage of uploaded files",
                  "United States",
                ],
                ["Twilio SendGrid", "Transactional email delivery (confirmations, replies)", "United States"],
              ],
            },
          },
          "In accordance with section 17 of Law 25, before entrusting information to a provider located outside Quebec we assess whether it will receive adequate protection there, in light of generally recognized data protection principles. Each provider is contractually bound by confidentiality and security obligations.",
          "Apart from these providers, we disclose your information to no third party, unless required by law or expressly requested by you.",
        ],
      },
      {
        id: "conservation",
        heading: "Retention and destruction",
        body: [
          "We keep your information only for as long as necessary for the purposes for which it was collected. After that, it is destroyed or anonymized.",
          {
            table: {
              head: ["Information", "Retention period"],
              rows: [
                [
                  "Orders, invoices and accounting records",
                  "6 years following the end of the relevant fiscal year, as required by tax authorities.",
                ],
                [
                  "Customer or professional account",
                  "For as long as the account exists. Deleted on request, subject to the accounting records above.",
                ],
                [
                  "Professional supporting document",
                  "For as long as the professional status remains active, then destroyed.",
                ],
                [
                  "Contact form messages",
                  "They are not stored in our database: they reach us by email and are kept for no more than 24 months.",
                ],
                ["Cookies", "See the lifetimes listed in section 6."],
              ],
            },
          },
        ],
      },
      {
        id: "securite",
        heading: "Security and confidentiality incidents",
        body: [
          "The site is served exclusively over HTTPS. Sessions rely on an encrypted HttpOnly cookie, access to data is restricted by role and verified server-side on every request, and no credit card data is stored by us.",
          "We maintain a register of confidentiality incidents. In the event of an incident presenting a risk of serious injury to you, we will promptly notify the Commission d'accès à l'information as well as the individuals concerned, as Law 25 requires.",
        ],
      },
      {
        id: "droits",
        heading: "Your rights",
        body: [
          "Law 25 grants you the following rights over your personal information:",
          {
            list: [
              "Access — obtain the information we hold about you.",
              "Correction — have inaccurate, incomplete or ambiguous information corrected.",
              "Deletion — have your account and any information no longer necessary to retain deleted.",
              "Withdrawal of consent — end, at any time, any processing based on your consent.",
              "Portability — receive, in a structured and commonly used technological format, the computerized information you provided to us, or have it sent to a third party.",
              "De-indexing and cessation of dissemination — request that dissemination of information about you cease, or that any hyperlink giving access to it be de-indexed, under the conditions set out in the Act.",
            ],
          },
          "To exercise any of these rights, write to the privacy officer. We respond within 30 days of receiving your request. Handling your request is free; should reasonable transcription or reproduction fees apply, we would inform you before proceeding.",
        ],
      },
      {
        id: "automatise",
        heading: "Automated decisions and profiling",
        body: [
          "No decision concerning you is made exclusively by automated means. Professional account requests are reviewed by a person. We carry out no profiling and use no identification, location or tracking technology.",
        ],
      },
      {
        id: "mineurs",
        heading: "Information concerning minors",
        body: [
          "Our store is intended for an adult clientele. We do not knowingly collect information concerning anyone under 14 without the consent of the person having parental authority. If you believe such information has been sent to us, write to us and we will delete it.",
        ],
      },
      {
        id: "plainte",
        heading: "Complaints",
        body: [
          `If you are not satisfied with how your request was handled, you may file a complaint with Quebec's Commission d'accès à l'information: ${CAI.site} or ${CAI.phone}.`,
        ],
      },
      {
        id: "modifications",
        heading: "Changes to this policy",
        body: [
          "Any change is published on this page and the update date is adjusted accordingly. Should a change materially alter how we handle your information, we would inform you before it takes effect.",
        ],
      },
    ],
    contact: {
      title: "Exercise your rights",
      role: "Person in charge of the protection of personal information",
      intro:
        "For an access, correction, deletion or portability request, or for any question about this policy:",
      subjectHint: 'Suggested subject: "Protection of personal information"',
    },
  },
};

/* ── Métadonnées ─────────────────────────────────────────────────────────── */

export async function generateMetadata(): Promise<Metadata> {
  const fr = (await getLocale()) === "fr";
  return {
    title: fr ? "Politique de confidentialité" : "Privacy policy",
    description: fr
      ? "Politique de confidentialité d'Améthyste conforme à la Loi 25 : renseignements recueillis, finalités, durées de conservation, fournisseurs hors Québec, et vos droits d'accès, de rectification et de portabilité."
      : "Améthyste's Law 25 compliant privacy policy: information collected, purposes, retention periods, providers outside Quebec, and your rights of access, correction and portability.",
    alternates: { canonical: "/confidentialite" },
  };
}

/* ── Rendu ───────────────────────────────────────────────────────────────── */

function num(i: number) {
  return String(i + 1).padStart(2, "0");
}

function DataTable({ table }: { table: Table }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink/15">
            {table.head.map((h) => (
              <th
                key={h}
                scope="col"
                className="py-2.5 pr-6 text-xs font-normal uppercase tracking-[0.14em] text-ink-mute last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]} className="border-b border-ink/[0.07] align-top last:border-0">
              <th scope="row" className="py-3.5 pr-6 font-normal text-ink">
                {row[0]}
              </th>
              {row.slice(1).map((cell, i) => (
                <td key={i} className="py-3.5 pr-6 last:pr-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("table" in block) return <DataTable table={block.table} />;
  return (
    <ul className="space-y-2.5">
      {block.list.map((item) => (
        <li key={item} className="relative pl-5">
          <span
            aria-hidden
            className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-amethyst-300"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const fr = locale === "fr";
  const c = CONTENT[fr ? "fr" : "en"];

  const updated = new Intl.DateTimeFormat(fr ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${LAST_UPDATED}T00:00:00Z`));

  return (
    <>
      <PageHeader
        eyebrow={fr ? "Loi 25 · Québec" : "Law 25 · Quebec"}
        title={fr ? "Politique de confidentialité" : "Privacy policy"}
        subtitle={c.subtitle}
      />

      <section className="pb-28">
        <Container className="max-w-6xl">
          <div className="grid gap-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
            {/* Sommaire — colonne fixe sur grand écran */}
            <aside className="hidden lg:block">
              <nav
                aria-label={c.tocTitle}
                className="sticky top-32 border-l border-ink/10 pl-5 text-sm"
              >
                <p className="eyebrow mb-4">{c.tocTitle}</p>
                <ol className="space-y-2.5">
                  {c.sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex gap-2.5 text-ink/55 transition-colors hover:text-amethyst-500"
                      >
                        <span className="tabular-nums text-ink/30">{num(i)}</span>
                        <span>{s.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <div className="min-w-0">
              {/* En bref */}
              <div className="rounded-2xl border border-ink/10 bg-amethyst-50/50 p-6 sm:p-8">
                <p className="eyebrow">{c.summaryTitle}</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {c.summary.map((s) => (
                    <li key={s} className="flex gap-3 text-sm leading-relaxed text-ink/70">
                      <svg
                        aria-hidden
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-[0.2em] shrink-0 text-amethyst-400"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-ink/10 pt-4 text-xs text-ink-mute">
                  {c.updatedLabel} : <time dateTime={LAST_UPDATED}>{updated}</time>
                </p>
              </div>

              {/* Sections */}
              <div className="mt-14 space-y-14 leading-relaxed text-ink/65">
                {c.sections.map((s, i) => (
                  <section key={s.id} id={s.id} className="scroll-mt-32 space-y-4">
                    <h2 className="flex gap-4 text-ink">
                      <span className="mt-[0.35em] shrink-0 text-xs tabular-nums tracking-[0.14em] text-amethyst-300">
                        {num(i)}
                      </span>
                      <span className="heading text-xl">{s.heading}</span>
                    </h2>
                    <div className="space-y-4 pl-0 sm:pl-9">
                      {s.body.map((b, j) => (
                        <BlockView key={j} block={b} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* Coordonnées du responsable — exigées par l'art. 3.1 */}
              <div className="mt-16 rounded-2xl border border-amethyst-200/60 bg-white p-6 sm:p-8">
                <h2 className="heading text-xl text-ink">{c.contact.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{c.contact.intro}</p>
                <div className="mt-6 space-y-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-mute">
                    {c.contact.role}
                  </p>
                  {PRIVACY_OFFICER.name && (
                    <p className="text-ink">{PRIVACY_OFFICER.name}</p>
                  )}
                  <a
                    href={`mailto:${PRIVACY_OFFICER.email}`}
                    className="inline-block text-amethyst-500 underline underline-offset-4 transition-colors hover:text-amethyst-700"
                  >
                    {PRIVACY_OFFICER.email}
                  </a>
                </div>
                <p className="mt-4 text-xs text-ink-mute">{c.contact.subjectHint}</p>
                <p className="mt-6 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink-mute">
                  {fr
                    ? "Vous pouvez aussi porter plainte auprès de la Commission d'accès à l'information du Québec : "
                    : "You may also file a complaint with Quebec's Commission d'accès à l'information: "}
                  <a
                    href={CAI.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-4 hover:text-amethyst-500"
                  >
                    {CAI.site}
                  </a>
                  {` · ${CAI.phone}`}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
