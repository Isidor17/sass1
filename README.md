# Atelier — MVP de gestion pour tailleurs (Sénégal)

Une application web mobile pour les ateliers de couture. On enregistre les mesures une fois, on suit chaque commande, on encaisse les acomptes et on prévient le client sur WhatsApp.

Elle est construite pour **tester l'usage réel avec 10 tailleurs pilotes**. Ce n'est pas encore un produit fini.

## Ce que fait le MVP

| Fonction | Où |
|---|---|
| Compte atelier : numéro de téléphone + code à 4–6 chiffres, sans email | `/inscription`, `/connexion` |
| Fiche client avec mesures en cm, historique des prises de mesures | `/app/clients` |
| Commande : modèle, quantité, prix, date promise, acompte Wave / Orange Money / espèces | `/app/commandes/nouvelle` |
| Statuts Reçu → En couture → Prêt → Livré, avec possibilité de revenir en arrière | `/app/commandes/[id]` |
| Reçu et « c'est prêt » envoyés sur WhatsApp par des liens `wa.me` pré-remplis | fiche commande |
| **Lien de suivi public** pour le client, sans compte | `/suivi/[jeton]` |
| **Carnet de mesures portable** que le client garde et montre à n'importe quel tailleur | `/carnet/[jeton]` |
| **Charge par semaine** comparée à la capacité de l'atelier (anticiper Tabaski / Korité) | tableau de bord, nouvelle commande |
| Tableau de bord : commandes en retard, à livrer sous 7 jours, prêtes, montant à encaisser | `/app` |
| **Import photo du carnet papier** : Claude lit la page, le tailleur relit et corrige avant d'enregistrer | `/app/clients/importer` |
| **QR code du carnet** : un autre tailleur le scanne et importe le client avec ses mesures ; sans compte, il est invité à s'inscrire | fiche client, `/carnet/[jeton]` |
| Installable sur l'écran d'accueil Android | `public/manifest.webmanifest` |

## Démarrer en local

```bash
npm install
cp .env.example .env        # puis changer SESSION_SECRET
npx prisma db push          # crée la base SQLite
npm run db:seed             # atelier démo : tél 77 000 00 00, code 1234
npm run dev                 # http://localhost:3000
```

Vérifications : `npm test` (tests unitaires), `npm run typecheck`, `npm run build`.

## Stack

- Next.js 15 (App Router, Server Actions). Le JavaScript côté navigateur est minimal, donc les pages restent légères sur un Android d'entrée de gamme et en 3G.
- Prisma. SQLite en local ; pour la production, mettre `provider = "postgresql"` dans `prisma/schema.prisma` et `DATABASE_URL` vers Supabase ou Neon.
- Aucune librairie UI : une feuille de style dans `src/app/globals.css`, avec mode sombre.

```
src/
  app/
    actions.ts           # toutes les écritures (server actions), vérifient l'atelier connecté
    app/…                # espace tailleur (protégé)
    suivi/, carnet/      # pages publiques client
  lib/                   # logique pure + tests (téléphone, PIN/session, capacité, WhatsApp, mesures)
  components/
prisma/schema.prisma     # Atelier, Client, MesureSet, Commande, Paiement
```

## Mise en ligne (pilote)

1. Créer une base Postgres (Supabase ou Neon, offre gratuite). Passer `provider` à `postgresql`.
2. Déployer sur Vercel. Variables à définir : `DATABASE_URL`, `SESSION_SECRET` (32 caractères aléatoires ou plus), `APP_URL` (l'URL publique, utilisée dans les liens WhatsApp et les QR codes), `ANTHROPIC_API_KEY` (import photo).
3. Lancer `npx prisma db push` une fois contre la base de production.

## Limites connues (choix assumés pour le pilote)

- **Hors ligne : non.** L'app est installable mais a besoin du réseau. C'est à faire si les tailleurs pilotes s'en plaignent (service worker + file d'attente locale).
- **WhatsApp manuel.** Le tailleur appuie sur « Envoyer » dans son WhatsApp. Ça ne coûte rien et ne demande aucune validation de Meta. L'envoi automatique (API WhatsApp Cloud) viendra quand l'usage sera prouvé.
- **Paiements déclaratifs.** Le tailleur note l'acompte reçu ; aucune intégration Wave / PayDunya pour l'instant.
- **Limitation des essais de code** gardée en mémoire du serveur : convient à une seule instance. À déplacer en base ou Redis si on passe à plusieurs.
- **Liste de mesures fixe** (`src/lib/mesures.ts`), à ajuster après les entretiens.
- Un seul utilisateur par atelier : pas d'employés ni d'apprentis.

## Import photo : fonctionnement et coût

- Le téléphone réduit la photo à 1600 px (environ 300 Ko) avant l'envoi : rapide en 3G.
- `src/lib/claude.ts` envoie l'image au modèle `claude-opus-5-5` avec une sortie structurée (schéma zod dans `src/lib/extraction.ts`). Le modèle n'invente rien : un chiffre illisible reste vide et il le signale dans « doute ».
- Le résultat est enregistré comme brouillon (`ImportPhoto`). Rien ne rejoint la base clients tant que le tailleur n'a pas validé.
- Le repli serveur (`fallbacks: "default"`) relance la requête sur un autre modèle si elle est refusée par les filtres de sécurité.
- Coût estimé : environ 0,02 à 0,05 $ par page avec Opus 5.5 (estimation, à mesurer). Pour réduire, passer à `claude-haiku-5-5`, en vérifiant d'abord la qualité de lecture sur de vrais carnets.

## À mesurer pendant le pilote

- Import photo : part des mesures correctes sans correction, et temps pour importer 20 anciens clients.
- Nombre d'ateliers inscrits via un carnet client scanné (`Client.origineCarnet` renseigné).

- Part des commandes livrées à la date promise, avant et après l'app.
- Nombre de tailleurs encore actifs après 4 semaines (au moins une commande créée par semaine).
- Nombre de clients qui ouvrent leur lien de suivi ou de carnet.
- Combien de tailleurs acceptent de payer, et sous quelle forme : mensuel ou forfait saison.
