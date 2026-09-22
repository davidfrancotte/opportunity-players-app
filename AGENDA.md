# Agenda unifié

Réseau contient désormais trois rubriques : Les membres, Jouer ensemble, Agenda.

L’Agenda (`/agenda`) affiche un calendrier mensuel, du lundi au dimanche, puis une liste chronologique. Un jour avec événement est coloré ; les points et la légende distinguent Matchs, RDV pro et Agenda sportif. Les filtres agissent sur la liste et les repères du calendrier. Cliquer sur une date limite la liste à cette journée ; « Tout le mois » enlève cette sélection. Les dates et les heures utilisent Europe/Brussels.

- Matchs : uniquement les créneaux confirmés des matchs organisés par l’utilisateur ou auxquels sa participation est approuvée pour ce créneau. Les annulations sont exclues.
- RDV pro : rendez-vous réservés impliquant le profil actif, essais confirmés, sessions et entretiens confirmés de son espace de travail. Sous la liste, le volet « Mes demandes de RDV » remplace les anciens boutons « Mes matchs et invitations » et « Gérer mes demandes de RDV ». Son badge compte les demandes reçues et envoyées encore en attente de réponse ou de créneau (pas les refusées, annulées ou confirmées). Chaque demande est dépliable. Le destinataire valide ou refuse ; l’expéditeur attend la réponse, puis choisit et confirme un créneau depuis ce même volet. Accepter une demande ne réserve pas encore un rendez-vous : le compteur diminue à la confirmation du créneau, au refus ou à l’annulation. Les droits existants sont conservés : personne ne peut accepter sa propre demande.
- Agenda sportif : événements marqués comme intéressants pour assister en tant que spectateur. Un intérêt n’est ni une réservation ni une participation au match. Ajout et retrait sont possibles dans « Événements à suivre comme spectateur » ; le retrait est aussi disponible dans la liste.

Les anciennes options (export ICS, rappels de démonstration, récurrence) sont regroupées dans le volet replié « Options de l’agenda » avec leurs accès Premium existants. L’export réutilise la même liste d’événements que le calendrier, tous mois confondus. L’ancienne adresse `/calendrier-avance` affiche désormais l’Agenda unifié ; `/rendez-vous` reste un écran de gestion des demandes, pas un onglet distinct du réseau.

Démonstration uniquement : événements sportifs fictifs, dont un intérêt initial pour illustrer l’agenda. Les interactions sont conservées pendant la visite, pas après un rechargement. Aucun backend, aucune billetterie ni connexion externe ajoutée.

Vérifications : `npm test`, `npm run typecheck`, `npm run build`, `node scripts/check-agenda-browser.mjs` et régression `node scripts/check-community-browser.mjs` (aperçu sur le port 3002).
