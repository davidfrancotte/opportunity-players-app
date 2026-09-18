# Déployer la démo Arena Studio

## Projet indépendant

Cette app est séparée du site vitrine. Créer un nouveau dépôt GitHub et un nouveau projet Netlify pour l’app ; ne pas remplacer le dépôt ou le projet Netlify du site vitrine.

Envoyer le contenu du dossier `studio` (celui contenant `package.json`) à la racine du nouveau dépôt. Ne pas envoyer son dossier parent qui contient les propositions de design et les archives. L’archive de livraison contient directement la bonne racine, sans `.git`, dépendances ou fichiers de compilation.

## Réglages Netlify

Importer le nouveau dépôt GitHub et utiliser :

- Branche de production : la branche contenant le code (habituellement `main`).
- Base directory : vide si `package.json` est à la racine.
- Build command : `npm run build`.
- Publish directory : `.next`.
- Node.js : `24`.

Le fichier `netlify.toml` contient déjà la configuration et active l’adaptateur officiel Next.js de Netlify. Aucun secret n’est nécessaire pour cette démo. Ne pas définir `NODE_ENV=development` ni désactiver l’installation des dépendances de développement.

**Ne pas utiliser Netlify Drop pour l’archive source ni publier seulement `public/`.** Netlify doit compiler le projet GitHub et préparer les ressources Next.js.

L’adresse de partage est obtenue depuis l’environnement Netlify. Pour imposer un domaine personnalisé dans les métadonnées, définir `SITE_URL` avec son URL HTTPS puis recompiler.

## Après déploiement

Tester :

1. La bienvenue, les deux accès et les cinq onglets de la barre basse.
2. L’inscription avec données fictives et `ArenaDemo2026!`, le code `246810`, la discipline, puis la présentation.
3. La modification du profil et le passage entre ses trois rubriques.
4. L’ajout/modification/retrait d’une expérience.
5. La galerie, le changement de portrait et le téléchargement du CV.
6. La récupération d’accès simulée et la réinitialisation de la démo.
7. La publication avec et sans illustration, le filtrage du fil par sport, les likes et commentaires.
8. La recherche de membres, les filtres sport/type et le suivi ; ouvrir un message depuis le réseau.
9. La création et la recherche de conversations, l’ajout de messages fictifs et le retour à la liste.
10. La recherche d’opportunités, les favoris, les détails et l’intérêt simulé.
11. Le rechargement direct de `/accueil`, `/reseau`, `/messages`, `/opportunities`, `/profil` et `/connexion`, puis l’affichage sur smartphone et au clavier.

Les changements disparaissent au rechargement : c’est volontaire. Ne pas saisir de données ni de mots de passe réels. Aucun email n’est envoyé, aucune identité n’est vérifiée, aucun contenu n’est publié.

Tester aussi `/abonnement` et les trois types de compte via le sélecteur de scénarios : tarifs 2,99 / 14,99 / 29,99 € par mois, quota gratuit sportif (le sixième envoi est refusé), publication sportive bloquée, contacts joueurs et réception bloqués pour les professionnels/collectifs gratuits, puis activation Premium simulée. Aucun paiement n’est relié à ces boutons. La démo n’est pas un système commercial prêt à encaisser.

Cette livraison n’effectue aucun push GitHub et ne crée ni ne publie de projet Netlify à votre place.

Documentation de référence : https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
