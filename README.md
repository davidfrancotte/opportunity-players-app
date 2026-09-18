# Opportunity Players — Arena Studio

Démo de l’app uniquement : identité Arena Studio validée, interface mobile-first, cartes anthracite arrondies, blanc cassé, vert acide et photographie sportive. Projet indépendant du site vitrine et de sa copie Netlify.

## Démarrer

Node.js 24, npm.

```bash
npm ci
npm run dev
```

Ouvrir l’adresse locale indiquée dans le terminal (port 3000 par défaut).

```bash
npm run build
npm start
```

## Essayer la démo

- Bienvenue et accès : `/`.
- Fil d’actualité : `/accueil`.
- Réseau : `/reseau`.
- Conversations : `/messages`.
- Marketplace d’opportunités : `/opportunities`.
- Offre Gratuit / Premium et simulation d’abonnement : `/abonnement`.
- Inscription en quatre étapes : `/inscription` → `/verification` → `/personnalisation` → `/presentation` → `/accueil`.
- Connexion : `/connexion`.
- Récupération simulée : `/mot-de-passe-oublie`.
- Profil et édition : `/profil`, `/modifier-profil`.
- Écrans Parcours et Médias : `/parcours`, `/medias`.
- Réinitialisation et explications : `/parametres`.

Identifiants **publics, fictifs et sans valeur d’authentification** : `alex@demo.example` / `ArenaDemo2026!`. Le code de vérification de démonstration est `246810`. Un profil créé pendant la visite peut aussi être ouvert avec son adresse et le même mot de passe de démonstration. Il ne s’agit pas de comptes protégés.

Les étapes intermédiaires invitent à recommencer si elles sont ouvertes directement sans parcours en cours. Le profil fictif d’Alex reste accessible directement pour les démonstrations.

## Fonctionnalités

- Navigation, formulaires et retours d’erreur en français.
- Tarifs mensuels définis par le porteur du projet : Sportif 2,99 €, Professionnel 14,99 €, Collectif 29,99 €. Aucune formule annuelle.
- Restrictions gratuites appliquées aux actions : sportif limité à cinq messages envoyés par mois et sans nouveau post ; professionnel/collectif sans contact avec les joueurs ni réception de messages/commentaires sur ses posts.
- Invitations Premium contextuelles, compteur mensuel, comparaison des offres, rappel des droits à l’inscription et retour à la rubrique après activation simulée. Le profil reste gratuit, sans carte bancaire.
- Fil filtrable par discipline : publication de texte avec illustration fournie facultative, likes et commentaires simulés.
- Réseau : recherche par nom, rôle ou ville, filtres Joueurs / Professionnels / Collectives et par sport, suivi et annulation du suivi, vue des membres suivis et fiche membre.
- Messages : liste et recherche de conversations, statut lu/non lu, nouvelle conversation et ajout de messages fictifs. Accès direct depuis une fiche du réseau.
- Opportunities : recherche, filtres sport et type d’annonce, favoris, détails et simulation réversible d’intérêt.
- Prénom, nom, email et mots de passe avec attributs d’autocomplétion ; visibilité du mot de passe et code à usage unique simulé.
- Inscription gratuite fictive, choix Sportif / Professionnel / Organisation, 12 disciplines, localisation, présentation et illustration.
- Profil éditable : identité, activité, discipline, ville, compétences, présentation, objectif.
- Parcours : ajout, modification et retrait d’expériences fictives.
- Galerie : choix de visuels fournis, agrandissement et retrait ; changement de l’illustration du profil.
- CV du profil courant téléchargé au format texte et explicitement marqué fictif.
- Indicateur de complétion calculé sur les rubriques renseignées.
- Réinitialisation confirmée de la démonstration.
- Interface smartphone sur toutes les tailles d’écran : largeur maximale de 480 px sur ordinateur, pleine largeur sur téléphone.
- Navigation fixe en bas : Accueil, Réseau, Messages, Opportunities, Profil, avec rubrique active. Masquée pendant la bienvenue, l’inscription et la connexion. Parcours et Médias sont des sous-rubriques de Profil ; Réglages reste accessible en haut.
- Marges de sécurité pour l’indicateur d’accueil et l’encoche, en-tête fixe au défilement et boutons d’enregistrement au-dessus de la navigation.
- Navigation clavier, dialogues avec gestion du focus et prise en compte de la préférence de mouvement réduit.

## Limites importantes

**Aucun backend, compte réel, authentification, vérification d’email réelle ou envoi d’email.** Aucun mot de passe saisi n’est conservé dans l’état partagé. Le profil, les publications, les suivis, les messages et les favoris restent uniquement dans la mémoire de l’onglet pendant la navigation et sont effacés au rechargement ou à la réinitialisation de la démo.

Tous les membres, clubs, publications, annonces et conversations fournis sont fictifs. Les messages ne sont pas envoyés, les posts ne sont pas publiés sur un réseau réel et aucun recruteur n’est contacté. Pas de stockage navigateur, téléversement, paiement, modération ou synchronisation entre appareils. Les filtres s’appliquent seulement au jeu de démonstration ; certaines disciplines n’ont volontairement aucun résultat.

L’activation Premium est simulée, sans facturation ni renouvellement. Les droits et quotas sont des règles d’interface en mémoire, **pas une sécurité ou un contrôle d’abonnement serveur**. Ils sont remis à zéro au rechargement. Un backend authentifié avec validation atomique des droits et des quotas est indispensable avant une utilisation réelle. Les montants viennent des décisions du porteur du projet, pas d’une vérification de tarifs commerciaux actuels. TVA, renouvellement et conditions de résiliation restent à préciser. Voir [SUBSCRIPTIONS.md](SUBSCRIPTIONS.md).

La galerie utilise seulement les illustrations fictives incluses. Le CV est un fichier `.txt`, pas un PDF ni un document officiel. `noindex` est présent pour cette démo, mais ce n’est pas un contrôle d’accès : une démo déployée publiquement sera consultable par tous.

Pour une vraie application, il faudra connecter un service d’identité sécurisé, vérifier les emails côté serveur, mettre en place la persistance et le contrôle d’accès, les mentions légales et les conditions de traitement des données. Ne pas utiliser cette logique de connexion simulée en production.

## Déploiement Netlify

Voir [DEPLOIEMENT_NETLIFY.md](DEPLOIEMENT_NETLIFY.md). Le dossier contenant ce README, `package.json` et `netlify.toml` est la racine du projet à envoyer dans un **nouveau dépôt GitHub**, distinct du site vitrine.

## Vérifications

```bash
npm test
npm run typecheck
npm run build
```

Pendant qu’un serveur local est démarré :

```bash
node scripts/validate-http.mjs http://localhost:3000
```

La compilation officielle de Netlify peut être testée localement sans publier :

```bash
npx --yes netlify-cli build --offline --context production
```

Les 27 tests unitaires couvrent le profil, les interactions sociales, les tarifs, les droits Gratuit / Premium, le quota mensuel, les destinataires bloqués, la réception masquée et la réinitialisation. Les contrôles HTTP couvrent les 17 écrans et les cinq destinations de navigation, ainsi que l’absence de rendu des messages reçus dans le compte professionnel gratuit. Ils ne remplacent pas une recette visuelle et des interactions sur de vrais appareils.

## Architecture et visuels

Next.js App Router + React + Tailwind + primitives shadcn/Base UI. Les états sont partagés par `components/demo-provider.tsx`. Les règles métier de démonstration testées sont dans `lib/model.ts` et le reducer `lib/social.ts`. Les nouveaux écrans sociaux sont dans `components/social-screens.tsx`, avec les styles `app/social.css`. L’accueil marketing, l’authentification et le profil restent séparés.

Les illustrations sportives, le pictogramme et l’image de partage sont repris de la direction Arena existante. Le nouveau coach fictif a été créé avec l’outil intégré de génération d’images ; brief exact dans [ASSET_PROMPT.md](ASSET_PROMPT.md). Version web optimisée : `public/images/coach.webp`. Aucune photo de membre réel ou donnée issue du compte existant n’est utilisée. Les cinq propositions de design restent dans le dossier voisin et ne font pas partie de l’app déployée.
