# Compléments du dossier sportif · démo Arena

## Disponible dans cette version

- Réseau / Joueurs : âge minimum et maximum inclusifs, handisport, disponibilité et situation contractuelle, combinés avec les critères existants. Les critères sportifs sont évalués sur **la même discipline**. L’âge est calculé à partir de la date de naissance ; un profil sans date ne répond pas à un filtre d’âge.
- Inscription : « Je m’inscris » ou « J’inscris mon enfant ». Dans le second cas : identité et date de naissance de l’enfant, nom/lien/attestation du représentant. L’adresse e-mail et le compte de communication appartiennent au représentant. Le profil est sportif ; les changements de catégorie sont désactivés. Une date indiquant un mineur en inscription personnelle bloque la progression. Le seuil de 18 ans est une règle de prudence de cette démo, pas une conclusion juridique.
- Profil / Modifier et Sports, niveaux & clubs : handisport facultatif, disponibilité immédiate ou datée, situation contractuelle, fédération, saison et numéro de licence par discipline.
- Dossier sportif : création, modification et suppression de distinctions (sport, titre, épreuve/organisme, année) ; aperçu des licences masqué ; ajout et suppression de vidéos locales.
- Vidéos : MP4/WebM, 50 Mo, durée lisible de 5 minutes maximum, titre/sport et attestation de droits. Les fichiers restent dans le navigateur, avec lecteur vidéo ; aucune publication réelle. Les URL temporaires sont libérées à la suppression/réinitialisation.
- Langues FR/EN : sélecteur sur l’accueil des parcours connectés et l’onboarding. Préférence de langue seulement enregistrée localement ; données de profil toujours éphémères. Les noms, témoignages, contenus saisis et contenus fictifs ne sont pas traduits automatiquement. Les vocabulaires de stockage restent inchangés pour préserver les filtres.
- CV texte : palmarès et situation sportive inclus ; date de naissance, coordonnées du représentant et numéro de licence exclus.

## Limites avant production

La démo ne constitue ni une authentification, ni une vérification parentale, ni une validation de licence. Le parcours enfant est un compte fictif géré par le représentant, sans sous-compte enfant autonome. Les préférences et attestations côté client ne sont pas des contrôles de sécurité.

À connecter côté serveur : stockage privé, autorisations par rôle, vérification du représentant et modalités d’échanges avec les mineurs, politique de visibilité du handisport, preuves de licence, upload/transcodage/modération des vidéos, suppression et conservation des données, workflow de recours, traductions éditoriales finales et politique de confidentialité validée. Aucun diagnostic médical, document d’identité ou donnée réelle d’enfant ne doit être saisi ici.

## Vérification

`npm test` inclut les tests d’âge, du représentant, des filtres combinés, des vidéos et de l’export privé. `npm run typecheck` et `npm run build` complètent les vérifications.
