# Recette Testeurs Pas a Pas

## Objectif

Ce document sert a faire tester la preprod sans improvisation.

Il est pense pour un lancement en cercle ferme:

- quelques testeurs de confiance
- un suivi structure
- pas d'ouverture publique large

Voir aussi:

- [premiers-testeurs-cible.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/premiers-testeurs-cible.md)
- [modele-feedback-testeurs.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/modele-feedback-testeurs.md)

## Roles de test

### Role 1 - proprietaire

Utilise le parcours principal:

- creation
- paiement
- generation
- dashboard
- publication

### Role 2 - proche invite

Utilise le parcours collaboration:

- reception email
- ouverture lien
- claim
- contribution

### Role 3 - visiteur public

Utilise le parcours public:

- URL publiee
- QR
- consultation

## Preparation avant session

Verifier avant chaque session:

- la bonne URL preprod
- un compte proprietaire
- un second compte pour le proche invite
- un acces a la boite email du proche
- un mobile pour tester le QR
- Stripe preprod disponible

## Regle simple pour les testeurs

Demander aux testeurs:

- de faire un seul parcours a la fois
- de noter l'heure du bug
- de faire une capture d'ecran a chaque blocage
- de ne pas relancer 10 fois la meme action
- de dire ce qu'ils attendaient avant de dire ce qui s'est passe

## Parcours A - proprietaire

### A1. Creation

1. Ouvrir la preprod.
2. Choisir `honorer`.
3. Aller jusqu'au questionnaire ou Alma.
4. Remplir quelques informations vraies de test:
   - prenom
   - nom
   - date
   - quelques souvenirs
5. Aller jusqu'a la suite du parcours.

### A2. Paiement

1. Lancer le checkout.
2. Completer le paiement Stripe preprod.
3. Revenir sur la confirmation.

### A3. Generation

1. Verifier que la confirmation n'affiche pas un message faux ou vide.
2. Lancer la generation du texte.
3. Attendre la fin.
4. Verifier:
   - pas de crash
   - pas de texte vide
   - pas de formulation choquante
   - le nom de la personne est bon

### A4. Dashboard

1. Ouvrir le dashboard du memorial.
2. Verifier:
   - le texte apparait
   - l'onglet texte charge
   - la personnalisation charge
   - la publication est accessible

## Parcours B - proche invite

### B1. Invitation

1. Depuis le dashboard proprietaire, ouvrir `Contributeurs`.
2. Inviter un proche.
3. Verifier:
   - l'invitation apparait dans la liste
   - le role est bon
   - le QR est disponible
   - l'email arrive si Resend est actif

### B2. Claim

1. Ouvrir le lien d'invitation avec le second compte.
2. Revendiquer l'acces.
3. Verifier:
   - pas d'erreur de token
   - pas de boucle de connexion
   - le memorial cible est le bon

### B3. Contribution

1. Ajouter un souvenir.
2. Verifier:
   - l'enregistrement reussit
   - le contenu ne disparait pas
   - le proprietaire retrouve bien la contribution

## Parcours C - publication et QR

1. Publier le memorial.
2. Verifier l'URL:
   - direct: `commun-vivant-prenomnom`
   - via pro: `prenomnom-nomdelentreprise`
3. Generer ou telecharger le QR.
4. Scanner le QR avec un mobile.
5. Verifier:
   - l'URL est la bonne
   - la page publique charge
   - la galerie s'affiche
   - le texte s'affiche

## Parcours D - regression autres journeys

### D1. Feter

1. Refaire un parcours `feter`.
2. Verifier:
   - pas de vocabulaire type `defunt`
   - occasion presente
   - ton adapte

### D2. Transmettre

1. Refaire un parcours `transmettre`.
2. Verifier:
   - pas de question de deces hors sujet
   - ton de transmission
   - template coherent

## Ce qui doit faire arreter la session tout de suite

- memorial public avec donnees privees inattendues
- acces d'un mauvais utilisateur a un memorial
- paiement confirme mais memorial introuvable
- texte genere pour la mauvaise personne
- contribution perdue
- QR menant au mauvais memorial
- email d'invitation envoye au mauvais destinataire

## Grille de validation simple

Chaque testeur peut repondre pour chaque parcours:

- `OK`
- `Gene mineure`
- `Bloquant`

## Definition des severites

- `Bloquant`: impossible d'avancer ou risque humain/securite
- `Majeur`: le parcours se termine mais dans de mauvaises conditions
- `Mineur`: detail UX ou wording sans casse fonctionnelle

## Sortie de session

A la fin, recuperer:

- le parcours teste
- les captures
- l'heure
- le compte utilise
- le resultat `OK / Mineur / Bloquant`
- la phrase exacte vue a l'ecran si le probleme est editorial
