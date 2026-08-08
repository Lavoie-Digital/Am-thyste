# Améthyste — Boutique e-commerce haut de gamme

Vitrine bilingue (FR/EN) pour la marque de soins capillaires **Améthyste** : boutique grand public (prix marché), **espace professionnel** avec prix de revente protégés par authentification + approbation, **panneau admin** d'approbation des pros, **tableau de bord propriétaire** (gestion produits/prix/commandes), paiements **Square**, courriels **SendGrid**, base de données **Firebase/Firestore**.

> Stack : Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · Framer Motion (`motion`) · Firebase · Square · SendGrid.

L'application **fonctionne immédiatement** avec des clés placeholder (mode démo : catalogue seed, prix marché, aucune écriture). Branchez vos vraies clés pour activer l'auth, les paiements et les courriels.

## 1. Démarrage

```bash
npm install
cp .env.example .env.local   # puis remplir les clés (voir §2)
npm run dev                  # http://localhost:3000
```

## 2. Configuration des services

### Firebase (base de données + authentification)
1. Créez un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → activez « E‑mail/Mot de passe ».
3. **Firestore Database** → créez la base (mode production).
4. **Paramètres du projet → Vos applications (Web)** → copiez la config dans les variables `NEXT_PUBLIC_FIREBASE_*`.
5. **Paramètres → Comptes de service → Générer une nouvelle clé privée** → renseignez `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (gardez les `\n` entre guillemets).
6. **Storage** → activez Firebase Storage (les images produits y sont téléversées depuis le tableau de bord ; seules les **URLs** sont stockées dans Firestore).
7. Déployez les règles de sécurité : `firestore.rules` (Firestore) **et** `storage.rules` (Storage). Les uploads sont réservés à l'admin (claim `role == 'admin'`), lecture publique.

### Square (paiements — formulaire de carte intégré, sans SDK npm serveur)
- `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `NEXT_PUBLIC_SQUARE_APP_ID`, `NEXT_PUBLIC_SQUARE_LOCATION_ID` (Dashboard Square → Developer → Credentials). `SQUARE_ENV=sandbox` pour tester sans facturer de vraie carte, `production` pour le compte live.
- Les prix viennent **de Firestore**, jamais du client (`lib/orders/priceCart.ts`, réutilisé par `/api/square/checkout` et `/api/square/pay`).
- Le paiement carte est **synchrone** : `/api/square/pay` appelle directement l'API Payments de Square (`fetch`, aucun SDK npm) et crée la commande dès que le paiement est `COMPLETED`. Le webhook n'est qu'un filet de sécurité idempotent.
- La taxe (GST/HST/PST/QST) n'est **pas** calculée automatiquement par Square comme l'était Stripe Tax — voir `lib/tax/canada.ts` (table best-effort, à valider avec un comptable).
- Webhook : URL fixe `https://amethystehairproductscanada.ca/api/square/webhook`, à enregistrer dans Dashboard Square → Developer → Webhooks (événements `payment.updated`, `refund.updated`). Square affiche la "Signature Key" après création de la souscription → copiez-la dans `SQUARE_WEBHOOK_SIGNATURE_KEY`.

### SendGrid (courriels — optionnel)
- `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL` (expéditeur vérifié). Sans clé, les envois sont ignorés proprement.

## 3. Initialisation des données

```bash
# Importer le catalogue + paramètres par défaut dans Firestore
node --env-file=.env.local scripts/seed-firestore.mjs

# Promouvoir la propriétaire en admin (après qu'elle se soit inscrite via /pro/inscription)
node --env-file=.env.local scripts/set-admin.mjs proprietaire@email.com
```

## 4. Parcours & routes

| Espace | Route | Accès |
| --- | --- | --- |
| Accueil (hero animé) | `/` | public |
| Boutique (prix marché) | `/boutique`, `/boutique/[slug]` | public |
| Checkout (modale Square) | panier → `CheckoutModal` | public |
| Programme pro | `/pro` | public |
| Inscription / connexion pro | `/pro/inscription`, `/pro/connexion` | public |
| Espace pro (statut) | `/pro/espace` | authentifié |
| Catalogue revente | `/pro/boutique` | pro **approuvé** |
| Admin — comptes pros | `/admin/pros` | admin |
| Tableau de bord | `/tableau-de-bord` (+ `/produits`, `/commandes`, `/parametres`) | admin |

## 5. Sécurité des prix de revente

Les prix de revente ne sont **jamais** envoyés au client tant qu'il n'est pas un pro approuvé : la couche serveur (`lib/data/products.ts → toDTO`) retire `resellerPrice` du DTO. Au checkout, le serveur **recalcule** chaque prix depuis Firestore selon le viewer vérifié (`lib/pricing.ts`) — les prix du panier client ne sont jamais utilisés.

## 6. Architecture (repères)

- `lib/auth/dal.ts` — autorité serveur (vérif cookie de session, `requireRole`).
- `app/api/session/route.ts` — échange ID token Firebase → cookie de session HttpOnly.
- `lib/data/*` — lecture Firestore (fallback seed si non configuré).
- `lib/actions/*` — server actions (auth, pro, produits, settings, contact).
- `app/api/square/*` — checkout (aperçu de prix) + pay (charge la carte, crée la commande) + webhook (filet de sécurité idempotent).
- `proxy.ts` — redirection optimiste des routes protégées (Next 16 renomme `middleware` en `proxy`).
- `components/storefront/AmethystStarsHero.tsx` + `StarField.tsx` — hero « étoiles améthyste ».

## 7. Scripts npm

`npm run dev` · `npm run build` · `npm run start` · `npm run lint`
