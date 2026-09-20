# Validation de la livraison Arena Studio

## 20 septembre 2026 : poids, taille et latéralité du sportif

- Champs facultatifs Poids (kg) et Taille (cm) dans l’inscription et l’édition, sans valeur inventée. Saisie décimale avec point ou virgule, validation des valeurs et possibilité d’effacer.
- Affichage dédié sur le profil sportif, lien de modification et inclusion des mesures renseignées dans le CV texte. Masqués pour les professionnels et organisations.
- Libellés Gaucher / gauchère, Droitier / droitière et Ambidextre pour le côté dominant par discipline, compatible avec les filtres existants.
- 54 tests unitaires réussis et vérification TypeScript. Recette navigateur : valeur négative refusée, 72,5 kg et 180 cm enregistrés et réaffichés, suppression possible, données conservées à l’inscription d’un sportif et non demandées aux autres catégories.
- Nouvelle interface vérifiée en viewport mobile ; comportement toujours limité à la session de démonstration. Aucun déploiement effectué.

## 20 septembre 2026 : recherche par catégorie et champs de profil

- 53 tests unitaires réussis, TypeScript et build Next.js de production validés.
- Réseau joueurs : sport, genre, pays, ville, niveau, position et côté dominant ; club et classement conservés.
- Professionnels : sport, pays, ville et 26 métiers. Collectifs : mêmes filtres géographiques et 7 types de structures.
- Inscription et modification utilisent le même vocabulaire que les filtres. Niveau, position et côté dominant sont propres à chaque discipline ; aucun croisement de critères entre deux sports.
- Recette navigateur à 390 px : filtres cumulés, aucun résultat, remise à zéro des critères spécifiques au changement de catégorie, édition d’un sportif, inscription complète des trois catégories et validation du type de compte requis.
- Pas de débordement horizontal du Réseau à 320, 390 et 430 px. Captures des formulaires et des filtres vérifiées. Tests sur Chrome avec viewport mobile, pas sur appareils physiques.
- Pays saisi librement avec suggestions ; recherche normalisée (accents et casse), pas de géocodage ni de validation d’adresse externe.
- Champs et filtres restent dans la démo locale ; aucun backend, push GitHub ou déploiement Netlify effectué pour cette mise à jour.

19 septembre 2026.

## Mise à jour : confiance et dossier multisport

- 47 tests unitaires réussis : règles existantes et nouveaux contrôles de modération de démonstration, blocage, formats/tailles de fichiers, recherche sur une même discipline, avis professionnels, parrainage et consentements.
- TypeScript et compilation de production réussis.
- Recette Chrome automatisée à 390 px : création du parcours multisport avec club, confirmation réciproque d’agent simulée, document PDF en attente, rejet SVG, qualification de filleul et récompense, recherche tennis/padel, avis en attente puis publié puis contesté, message filtré sans envoi, signalement, blocage, inscription avec cases obligatoires puis e-mail et second code.
- Absence de débordement horizontal à 320, 390 et 480 px sur Profil, Disciplines, Agent, Documents, Parrainage, Sécurité, Réseau, Inscription et Confidentialité. Correction du champ fichier à 320 px.
- Captures examinées pour le profil et les filtres. Aucun nouvel incident JavaScript navigateur pendant la recette.
- Non-régression matchs : invitations gratuites privées, accès Premium, création multi-créneaux, total avec +1, quorum, confirmation, agenda, notifications, message reçu et candidature à proximité.
- Les parcours s’exécutent sur un navigateur de bureau avec viewport mobile ; pas de validation sur smartphone physique.
- Export source actualisé sans push GitHub ni nouveau déploiement Netlify. Aucun contrôle automatique réel côté serveur ajouté : voir TRUST_SAFETY.md.

## Historique de la livraison initiale

Les vérifications suivantes décrivent la livraison initiale, avant les écrans de matchs et de confiance.

- Compilation de production Next.js 16.3.5 : réussie, avec contrôle TypeScript.
- Compilation officielle locale Netlify en contexte production : réussie ; adaptateur Next.js 5.16.0, Netlify Build 37.0.0, fonction serveur créée et empaquetée.
- Vingt-sept tests unitaires : profil/authentification, interactions sociales, tarifs définitifs, restrictions Gratuit / Premium, sixième message refusé, changement de mois/année, compteurs multi-conversations, refus sans débit, réception et commentaires, abonnement par type de profil et réinitialisation.
- Dix-sept écrans : HTTP 200 en développement et en production, métadonnées de préversion, langue française et repères principaux vérifiés.
- Les messages entrants du compte professionnel gratuit ne sont pas rendus dans le HTML de la messagerie. Le comportement des sélecteurs de réception est couvert par tests unitaires.
- Navigation mobile : cinq liens (Accueil, Réseau, Messages, Opportunities, Profil) et une seule destination active sur chaque écran applicatif ; absente de la bienvenue et de l’authentification. Parcours, Médias, Édition, Réglages et Abonnement conservent Profil actif.
- Cadre mobile sur tous les écrans, viewport-fit=cover, styles de navigation fixe et marges safe-area vérifiés dans le code ; barre d’enregistrement décalée au-dessus de la navigation.
- Vérification des liens internes et de toutes les images, ainsi que des ressources compilées référencées par les pages.
- Quatre routes inexistantes/hors périmètre : HTTP 404.
- Étapes intermédiaires : reprise du parcours demandée lors d’un accès direct sans état d’inscription.
- Attributs d’autocomplétion vérifiés dans le HTML de l’inscription ; boutons de soumission désactivés avant hydratation JavaScript.
- Mise en page smartphone également sur ordinateur (480 px maximum), cibles tactiles de la navigation et styles de mouvement réduit présents.
- Aucune dépendance ajoutée ; audit de production de la livraison initiale sans vulnérabilité signalée.
- Lint ciblé des écrans sociaux, profil, provider et reducer : aucune erreur.

Pas de capture ni de test d’interactions dans un navigateur. Les tests de code et HTTP ne constituent pas une validation visuelle sur appareils réels. Une recette manuelle des parcours reste recommandée avant présentation publique.

Aucun push GitHub, aucun déploiement Netlify et aucune modification du site vitrine ont été réalisés pour cette livraison. L’aperçu local est distinct du site actuellement en ligne. Les identifiants et codes présents dans le code sont volontairement publics et fictifs, pas des secrets.
