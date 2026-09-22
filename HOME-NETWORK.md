# Home et Network · 22 septembre 2026

Cette évolution concerne l’app mobile autonome dans ce dossier, pas le site vitrine ni ses copies exportées.

## Home

- Un seul fil de communauté. Suppression des blocs de matchs et de recommandations en tête de page.
- Publications limitées à trois lignes de texte dans l’accueil, avec `.....` uniquement si le texte est tronqué. Le calcul suit la largeur réelle, la police et les retours à la ligne. Cliquer sur le texte, l’image ou « Voir la publication » ouvre la publication complète, ses réactions et ses commentaires. Les textes courts restent intacts.
- Filtre repliable pour Premium : texte, sport et catégorie (matchs ouverts, emplois, opportunités, news, divers).
- Sous-catégories d’opportunités : recrutement de joueurs, essais et détections, partenaires de jeu, coaching et accompagnement, sponsoring et partenariats.
- Les matchs ouverts du fil utilisent les vrais objets de la démo et respectent les règles de visibilité et le rayon. Les publications possèdent une catégorie explicite.
- Création de post selon les droits de publication existants. Les comptes payants peuvent programmer une date dans ce même éditeur. Catégorie, sous-catégorie et illustration sont conservées lors de la diffusion.
- La programmation reste locale : l’onglet doit rester ouvert. Le lien des publications programmées permet de les consulter, d’annuler ou de simuler la date. Aucun service de planification en arrière-plan.

## Network · Members

- « Suivre » alimente le fil avec les publications de la personne sans créer de connexion. Le fil affiche les publications des profils suivis et celles de l’utilisateur.
- « Connect », dans le profil d’un membre, envoie une demande. Seule l’acceptation du destinataire crée la connexion. Les demandes reçues s’acceptent/se refusent dans Invitations ou dans le profil. Les demandes envoyées peuvent être retirées et sont listées séparément.
- Une connexion acceptée permet les messages sans consommation du quota de nouvelles prises de contact, y compris en Gratuit, et l’invitation personnelle à un match. Hors connexions, les règles de contact existantes restent applicables. L’acceptation active aussi le suivi, qui peut être retiré indépendamment de la connexion.
- Les membres bloqués restent exclus des échanges, de l’acceptation et des invitations. La création d’un match vérifie aussi les connexions au niveau du modèle, même pour une sélection préremplie par URL.
- Démo locale : « Simuler la réponse du destinataire » joue explicitement l’autre côté d’une demande envoyée. Aucun envoi réel ni validation automatique. En production, les identités et les réponses devront être contrôlées côté serveur.

- Recherche textuelle avec bouton fléché. Premium ajoute une flèche pour déplier pays, ville, sport et classement.
- Invitations personnelles à rejoindre le réseau : deux visibles au maximum, liste dépliable, acceptation et refus. Accepter ajoute le membre aux suivis. Blocage et réinitialisation respectés.
- Suggestions « Vous les connaissez peut-être », sans membres bloqués, déjà suivis ou encore en attente d’invitation.

## Network · Play together

- Onglets Mes invitations, J’organise, À proximité avant les filtres.
- Sport ensuite. Rayon des matchs ouverts dans Mes invitations et À proximité, absent de J’organise.
- Le rayon ne masque jamais une invitation personnelle. En gratuit, valeur indicative de 50 km non modifiable.
- À proximité est Premium pour les trois types de comptes. Accès direct aux matchs ouverts également protégé par les règles du modèle.
- Alertes de matchs configurables dans À proximité uniquement sur cet écran. Aucun lien Récurrence & agenda en tête de page. Les accès globaux à l’agenda restent conservés.

## Vérifications

`npm test` inclut les cas de régression `scripts/community.test.mjs`.

`node scripts/check-community-browser.mjs` vérifie les parcours gratuit/Premium sur le serveur local 127.0.0.1:3002, la publication différée, les filtres et les tailles d’écran.

Les abonnements, profils, données et invitations restent simulés en mémoire. Avant production : persistance, identité authentifiée, droits côté serveur et moteur de programmation/notifications réel.
