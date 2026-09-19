# Abonnements — règles de la démo

Version du 19 septembre 2026. Dernière décision explicite du porteur du projet : **2,99 €/mois sportif, 14,99 €/mois professionnel, 29,99 €/mois collectif**. Le tarif professionnel de 19,99 € a été remplacé avant livraison. Source unique des prix : `lib/pricing.ts`, valeurs en centimes.

## Règles

| Fonction | Sportif gratuit | Professionnel / collectif gratuit | Premium simulé |
| --- | --- | --- | --- |
| Créer le compte, consulter, suivre | Oui | Oui | Oui |
| Créer un post | Non | Oui | Oui |
| Envoyer des messages | 5 par mois civil | Pas aux joueurs | Sans le quota gratuit |
| Recevoir des messages | Oui | Non | Oui |
| Commenter un post de joueur | Oui | Non | Oui |
| Recevoir des commentaires sur ses posts | Pas de nouveau post gratuit | Non | Oui |

Le destinataire doit aussi avoir le droit de recevoir : le propre abonnement de l’émetteur ne contourne jamais cette règle. Les commentaires adressés aux professionnels/collectifs gratuits sont refusés. Les membres fictifs Sam Delcourt et United Sport illustrent des destinataires gratuits ; les autres destinataires professionnels/collectifs du jeu de démo sont considérés Premium. Aucun statut réel n’est déduit.

Interprétations explicitement retenues :

- Le quota compte chaque message envoyé, pas seulement le démarrage d’une conversation.
- Les commentaires, lectures et réceptions ne consomment pas ce quota.
- Les messages invalides, refusés ou sans destinataire/conversation ne consomment rien.
- La remise à zéro est calendaire, fuseau Europe/Brussels. Le changement de mois est vérifié à chaque envoi, périodiquement et au retour de focus.
- Un professionnel gratuit peut envoyer un message à un professionnel/collectif abonné, mais ne peut pas recevoir de réponse tant qu’il n’a pas Premium. La règle utilisateur concernant les contacts avec les joueurs est donc distinguée de celle concernant toute réception.
- Premium sportif retire le quota gratuit dans cette proposition. Aucune autre limite Premium n’a été définie.
- Un passage simulé Premium puis Gratuit conserve les messages gratuits déjà consommés pendant le mois.
- Le plan simulé est attaché au type de profil ; changer de type ne transfère pas l’abonnement.

## Conversion

### Matchs et invitations

Créer un match et découvrir les invitations ouvertes à moins de 50 km sont réservés aux abonnés, pour les trois types de compte. Les prix mensuels ne changent pas. Un membre gratuit peut répondre à une invitation personnelle et consulter les matchs auxquels il a déjà été accepté ; ces réponses ne consomment pas son quota de messages. Une candidature publique en attente ne rend pas le match public accessible après retour au gratuit. Les matchs déjà organisés restent gérables pour ne pas abandonner leurs participants.

Les règles sont vérifiées dans `lib/events.ts`, y compris les liens directs. Comme toutes les données sont incluses dans cette démo cliente, ce contrôle ne protège aucune donnée réelle et doit être reproduit par une API authentifiée en production.

- Inscription gratuite avec droits lisibles avant de terminer.
- Encarts de statut et prix liés au profil, au fil et à la messagerie.
- Fenêtres Premium déclenchées par une action précise, jamais au chargement par défaut.
- Raison du blocage, avantages et prix avant l’activation.
- Choix visible pour rester gratuit, sans compte à rebours, réduction fictive ou statistiques inventées.
- Comparaison des offres, explication du quota et des destinataires indisponibles.
- Simulation d’activation sans carte et retour à la rubrique d’origine.
- Dans Abonnement, « Tester un autre cas dans la démo » permet de tester les trois types et de revenir au gratuit.

## Limites et conditions à finaliser

Tout est fictif et en mémoire. Les exemples de messages entrants fournis au départ sont masqués pour un professionnel/collectif gratuit, y compris dans les aperçus et la recherche. Ils restent des fixtures incluses dans le code, **pas des données protégées**. Les règles centralisées du reducer ne remplacent pas des contrôles serveur.

Avant lancement : identité et abonnements serveur, compteur mensuel atomique, traitement des paiements et événements de facturation, protection des messages, anti-spam, gestion des consentements, TVA, renouvellement, annulation et remboursement. Aucun de ces services n’est connecté ici. Aucun paiement, achat, annulation ou notification externe n’a été exécuté.

Aucune formule annuelle, remise, période d’essai facturable ou mention TTC/HT n’est supposée. Les tarifs précédemment relevés sur la plateforme ont été écartés au profit des montants explicitement choisis pour cette version.
