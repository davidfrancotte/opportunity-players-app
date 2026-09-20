# Extensions des offres — démonstration interactive

Référence : fichier `Opportunity_Players_Offres_Gratuit_Premium.xlsx` modifié par le propriétaire, puis clarification : **commentaires, réactions et partages restent gratuits ; seule la création de publications est payante pour sportifs et collectifs**.

## Essayer

Ouvrir `/outils`. Dans `/abonnement`, choisir la catégorie fictive puis activer Premium sans paiement. Les pages d’outils proposent également des rôles fictifs pour essayer un professionnel et un collectif. Les données restent en mémoire dans l’onglet et sont réinitialisées au rechargement. Ne pas utiliser de données personnelles réelles.

| Extension du fichier | Parcours livré dans la démo | Où l’essayer |
|---|---|---|
| Programmation des publications | Créer un contenu, sélectionner sa date, annuler, diffuser dans le vrai fil de la démo. Vérification tant que l’app est ouverte ; bouton pour simuler l’arrivée de la date. Retour au gratuit : diffusion suspendue. | `/publications-programmees` |
| Recherches enregistrées et alertes | Sauvegarder les filtres du réseau ; créer des recherches d’opportunités ou de matchs ; revoir les résultats ; détecter de nouvelles correspondances avec déduplication des alertes. Quotas 1 gratuit / 10, 20 ou 30 Premium. | `/reseau`, `/recherches` |
| Rayon et alertes de matchs | Rayon réglable, sport, niveau et heure minimale. Distance sur les villes belges connues de la démo, pas de géocodage réel. | `/jouer`, `/recherches` |
| Duplication et événements récurrents | Réutiliser un de ses matchs sur 1 à 12 dates hebdomadaires. Votes et confirmations ne sont pas copiés. Validation atomique et quota des événements actifs. | `/calendrier-avance` |
| Agenda externe et rappels | Choix d’un fournisseur et connexion explicitement simulée ; rappel 15 min, 1 h ou 1 jour ; test de notification ; export réel d’un fichier .ics d’événements fictifs. | `/calendrier-avance` |
| Statistiques par catégorie | Totaux gratuits et détail Premium : visites/interactions simulées, identité seulement avec consentement, candidatures, rendez-vous, essais, publications et délai de réponse des demandes traitées. Aucun chiffre de production inventé. | `/statistiques` |
| Sessions d’essais groupées | Plusieurs sessions avec date, lieu, capacité, candidats invités ; réponses individuelles simulées ; synthèse des confirmations et inclusion dans l’agenda. | `/essais-groupes` |
| Listes de favoris / viviers | 1 liste et 20 profils en gratuit ; 20 ou 30 listes et 1 000 entrées au total en Premium ; ajout et retrait de profils. | `/talents` |
| Portefeuille métier | Liste de profils, présentation, notes privées, étapes de suivi et date de prochaine démarche. | `/talents` |
| Disponibilités récurrentes | Séries hebdomadaires de créneaux de 30 minutes, intégrées à la prise de rendez-vous existante ; collision refusée et disponibilités masquées avant acceptation. | `/calendrier-avance`, `/rendez-vous` |
| Présentation des équipes | Créer plusieurs sections, discipline et description publique. | `/equipes` |
| Gestion structurée des équipes | Membres et staff par section, besoins internes et événements associés. | `/equipes` |
| Liens confirmés joueurs / staff | Demande de lien, réponse simulée, visibilité uniquement après confirmation ; retrait possible de l’accord. | `/equipes` |
| Gestionnaires et permissions | Propriétaire inclus dans les 5 places Premium, invitations et acceptation simulées ; rôles administrateur, recruteur et lecture seule ; test des autorisations. | `/equipes` |
| Collaboration | Attribution de profils à un gestionnaire, commentaires internes attribués à leur auteur ; permissions appliquées également aux décisions de recrutement. | `/equipes`, `/recrutement` |
| Entretiens coordonnés | Proposer un créneau à un candidat et au staff ; accord de tous requis ; refus annule ; collisions contrôlées ; entretien confirmé ajouté à l’agenda. | `/calendrier-avance` |
| Agenda partagé | Rendez-vous, essais, matchs confirmés et entretiens réunis dans l’espace de la structure. Les gestionnaires fictifs partagent cet état dans la même session. | `/calendrier-avance` |
| Suivi collectif des invitations | Invitation, inscription, e-mail vérifié, activation qualifiée : chaque étape se teste explicitement. Récompense potentielle affichée, sans crédit réel. | `/statistiques` |

## Deux commentaires à clarifier dans le fichier

Les remarques **Sportifs E26** et **Professionnels E21** concernent la même fonction. Exemple : enregistrer « Tennis / Bruxelles / niveau confirmé » conserve ces filtres pour les relancer en un clic. L’option « M’alerter des nouveautés » signale l’apparition d’un résultat inédit correspondant. Ce n’est ni une demande de contact ni un message envoyé à quelqu’un.

## Accès et quotas

`lib/entitlements.ts` centralise les limites de l’offre. `lib/offer-catalog.json` reprend les trois tableaux et la clarification sur les interactions. Ils alimentent la page Abonnement.

Les nouvelles prises de contact sont comptées au **premier message vers un nouvel interlocuteur**, pas sur toutes les réponses. Réception et réponses sont gratuites dans toutes les catégories. Les quotas mensuels sont calculés en heure de Bruxelles. Les nouvelles limites des photos, documents, vidéos (dont 1 min / 3 min pour les collectifs), candidatures, offres, rendez-vous et événements ont été intégrées aux parcours existants. Les contenus ne sont pas supprimés lors d’un retour au gratuit.

## Limite volontaire : démonstration, pas service connecté

- Pas de base de données, de paiement ni de compte réel. Aucun message, e-mail ou notification push envoyé.
- Les publications/alertes ne tournent pas lorsque le navigateur est fermé. Le bouton de simulation ne change pas l’heure de l’appareil.
- L’agenda externe n’est **pas** réellement connecté. L’export .ics est un instantané manuel, pas une synchronisation bidirectionnelle.
- Les rôles et confirmations simulent les deux côtés d’un parcours dans un onglet, pas une authentification multi-utilisateur.
- Les visites et activations sont des événements de test explicitement déclenchés. Les statistiques de production ne sont pas disponibles.
- Avant production : autorisations et quotas côté serveur, stockage privé, tâches planifiées, notifications consenties, connexion OAuth aux calendriers, audit des droits, anti-spam et antifraude.

## Vérification

Les tests automatiques couvrent notamment quotas, filtrage et modération existants, isolation des espaces, recherches/alertes, programmations, permissions, consentement des liens, sessions, entretiens et export d’agenda. Des parcours navigateur sont également vérifiés sur l’app mobile et l’espace membre web. La version web réutilise les règles de la démo tout en conservant ses vues bureau et thèmes clair/sombre.
