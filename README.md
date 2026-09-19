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

Les tests unitaires couvrent le profil, les interactions sociales, les tarifs, les droits Gratuit / Premium, le quota mensuel, les destinataires bloqués, la réception masquée, les matchs et la réinitialisation. Les contrôles HTTP couvrent les 22 écrans et les cinq destinations de navigation, ainsi que l’absence de rendu des messages reçus dans le compte professionnel gratuit. Ils ne remplacent pas une recette visuelle et des interactions sur de vrais appareils.

## Jouer ensemble, agenda et notifications

La rubrique **Réseau → Jouer ensemble** regroupe les invitations personnelles, les matchs organisés et les invitations ouvertes à proximité. L’accueil propose un raccourci de création et le prochain match confirmé. L’agenda et les notifications sont accessibles dans l’en-tête ; les cinq onglets du bas sont conservés.

- Création et découverte des invitations ouvertes : Premium pour toutes les catégories (2,99 € / 14,99 € / 29,99 € par mois).
- Réponse à une invitation personnelle : gratuite, hors quota de messages.
- Un match propose 1 à 6 créneaux ; chaque invité peut choisir plusieurs dates et un +1 par date. Un bouton permet de créer un autre match similaire avec de nouvelles dates.
- Les seuils désignent un **total de participants**, organisateur inclus s’il joue, et amis +1 compris. Minimum et capacité maximale sont modifiables. Les suggestions par sport sont des paramètres produit, pas des règles fédérales.
- Une candidature externe reste hors comptage jusqu’à acceptation. Le quorum déclenche une alerte mais jamais une confirmation automatique. La confirmation de l’organisateur ferme les autres propositions et génère les notifications des destinataires.
- Les notifications des autres membres sont conservées dans le modèle de simulation, pas envoyées. Le compte courant voit uniquement ses propres notifications. Les préférences permettent de désactiver les bannières et rappels.
- Les rappels sont vérifiés toutes les 30 secondes tant que la démo est ouverte : moins de 24 h, puis moins de 2 h, sans doublons. Aucune notification système en arrière-plan, aucun e-mail ni push réel.
- Le rayon de 50 km utilise la distance entre centres de sept villes belges de démonstration. L’adresse saisie n’est pas géocodée ; elle est masquée pour les candidats non acceptés. Aucune localisation du téléphone n’est demandée.
- Un désistement retire aussi le +1 et alerte l’organisateur si le minimum n’est plus atteint. Le match n’est pas annulé automatiquement ; l’organisateur peut l’annuler et organiser un remplacement.

Pour tester : répondre à l’invitation de Noah en gratuit ; activer Premium dans Abonnement ; créer un match ; utiliser « Tester les réponses · simulation » pour simuler les autres participants ; confirmer le créneau ; consulter Agenda et Notifications. Les préférences de Notifications permettent aussi de simuler une invitation ou un message reçu.

Code : `lib/events.ts`, `components/play-screens.tsx`, `components/event-navigation.tsx`, `app/events.css`. Tests : `scripts/events.test.mjs`. Tout est en mémoire et disparaît au rechargement. Avant production : comptes authentifiés, abonnement vérifié côté serveur, stockage, géocodage des lieux, transactions empêchant les doubles réservations, modération, règles mineurs/confidentialité et moteur de notifications avec consentement.

## Architecture et visuels

Next.js App Router + React + Tailwind + primitives shadcn/Base UI. Les états sont partagés par `components/demo-provider.tsx`. Les règles métier de démonstration testées sont dans `lib/model.ts` et le reducer `lib/social.ts`. Les nouveaux écrans sociaux sont dans `components/social-screens.tsx`, avec les styles `app/social.css`. L’accueil marketing, l’authentification et le profil restent séparés.

Les illustrations sportives, le pictogramme et l’image de partage sont repris de la direction Arena existante. Le nouveau coach fictif a été créé avec l’outil intégré de génération d’images ; brief exact dans [ASSET_PROMPT.md](ASSET_PROMPT.md). Version web optimisée : `public/images/coach.webp`. Aucune photo de membre réel ou donnée issue du compte existant n’est utilisée. Les cinq propositions de design restent dans le dossier voisin et ne font pas partie de l’app déployée.
