# Confiance, dossier sportif et parrainage

Version de démonstration du 19 septembre 2026. Aucun traitement de données réelles ne doit être lancé avec cette architecture front-end seule.

## Frontière de la démo

- État React en mémoire d’onglet, effacé au rechargement. Aucun compte ni autorisation de sécurité réelle.
- Filtre déterministe très limité, non exhaustif : pas de classification IA, détection fiable de contournements ou compréhension du contexte.
- Photos et PDF sélectionnés : métadonnées uniquement ; aucune publication ni analyse serveur. Les exemples existants sont des illustrations sportives fournies.
- Codes publics fixes pour montrer les étapes e-mail et second facteur. Ni preuve de contrôle d’une adresse, ni configuration MFA réelle.
- Avis, liens d’agent, signalements et récompenses : simulations locales. Les boutons de validation/modération simulent un autre rôle et ne constituent pas un système de permissions.
- Notice de confidentialité incomplète pour un service réel ; elle explique la démo et la charte, sans prétendre garantir une conformité juridique.

## À implémenter côté serveur avant lancement

### Modération et signalements

Intercepter chaque écriture et chaque pièce jointe, y compris messagerie, profils, publications, commentaires, événements et avis. Effectuer une analyse contextuelle multilingue du racisme, sexisme, discrimination, harcèlement et menaces ; prendre en compte les erreurs, citations, usages légitimes et contournements. Aucun simple filtre de mots ne doit être présenté comme une garantie.

Quarantaine jusqu’à décision : accepté, refusé, ou examen humain. Analyser conjointement sécurité et pertinence sportive des images ; autoriser les portraits professionnels, équipes, installations et justificatifs pertinents, pas seulement les scènes d’action. Prévoir motifs compréhensibles, recours, audit et révision humaine. Les membres bloqués ne doivent pouvoir échanger dans aucune direction. Notifications génériques sans reproduire d’injure ni révéler l’identité du signalant.

### Documents

Vérifier taille, extension, MIME et signature réelle, analyser les virus et neutraliser les contenus actifs, supprimer les métadonnées inutiles des images. Stockage privé, accès autorisés, liens expirants, rétention limitée et suppression. Ne jamais rendre public par défaut un CV qui peut contenir adresse, téléphone ou autres informations privées.

Référence technique : [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

### Authentification et information

Validation d’adresse avec jeton serveur aléatoire, expirant et à usage unique, limitation des tentatives et renvois. Comptes non vérifiés limités côté serveur. Véritable second facteur via TOTP ou passkey selon le schéma retenu, enrollement sécurisé, récupération et révocation ; ne pas réutiliser l’e-mail comme seul facteur additionnel. Supprimer les codes de test avant lancement.

Tracer la version et la date de prise de connaissance de la notice et d’acceptation de la charte/attestation. Distinguer l’information RGPD d’un consentement marketing, non demandé dans cette démo. Faire valider les finalités, bases légales, responsable, contacts, destinataires, durées, transferts et droits ; prévoir les règles propres aux mineurs si admis.

Sources : [OWASP Email Verification](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html), [OWASP MFA](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html), [CNIL — information des personnes](https://www.cnil.fr/fr/conformite-rgpd-information-des-personnes-et-transparence).

### Parcours et évaluations

Modéliser disciplines, référentiel/fédération, classement, saison et clubs avec identifiants stables. Ne pas convertir automatiquement des classements de fédérations différentes ni amalgamer niveaux déclarés et réputation.

Déclaration d’agent distincte d’une confirmation réciproque authentifiée, révocable par chaque partie, avec historique. Vérifier l’identité professionnelle et l’expérience avant validation d’un avis ; un avis par professionnel et expérience. Exiger un compte autorisé et appliquer les restrictions Premium existantes. Calculer séparément les scores par sport à partir des seuls avis publiés. Prévoir contestation et droit de réponse.

### Parrainage

La proposition affichée est trois mois par nouveau membre distinct après e-mail vérifié, profil complété et première connexion ; les conditions commerciales restent à valider. Attribution serveur via identifiant de parrain, déduplication idempotente, exclusion auto-parrainage/comptes frauduleux, limites de fréquence et révision humaine.

Synchroniser un registre de crédits avec la facturation ; définir plafond, cumul, expiration, rétractation, abonnement déjà actif et montant applicable selon catégorie. Ne pas présenter une activation locale comme une prolongation de facture réelle. Le lien et les étapes de la démo ne suivent pas d’inscriptions.

## Vérification

`npm test` comprend les règles de filtrage, blocage, fichiers, filtres multisports, avis, parrainage et consentements, en plus des tests existants. `npm run typecheck` et `npm run build` contrôlent l’intégration. Ces tests vérifient le prototype, pas l’efficacité d’une modération de production.
