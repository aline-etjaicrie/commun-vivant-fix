# Go-Live Checklist

## Objectif

Ce document sert de check-list operative avant:

- l'ouverture a un cercle de testeurs
- l'ouverture a une vraie production

Il complete:

- [go-live-hardening.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/go-live-hardening.md)
- [supabase-preprod-protocol.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/supabase-preprod-protocol.md)
- [testeurs-recette-pas-a-pas.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/testeurs-recette-pas-a-pas.md)
- [modele-feedback-testeurs.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/modele-feedback-testeurs.md)
- [prod-cutover-runbook.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/prod-cutover-runbook.md)

## 1. Gate testeurs

Le projet peut etre ouvert a des testeurs externes si toutes les cases suivantes sont cochees.

### Code et build

- `npm run lint` passe
- `npm run build` passe
- la preview Vercel utilise la bonne branche
- aucune variable mock n'est active en preprod

### Variables d'environnement preprod

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`
- `MISTRAL_API_KEY`
- `MISTRAL_AGENT_ID`
- `VIDEO_WORKER_SECRET` si la video est exposee aux testeurs

### Flags a verifier

- `ALLOW_MOCK_PAYMENTS=false`
- `ALLOW_TEST_UNLOCK=false` en dehors des tests strictement encadres
- `NEXT_PUBLIC_ALLOW_TEST_UNLOCK=false`
- `NEXT_PUBLIC_ALMA_BETA_FREE` conforme a la recette voulue

### Base de donnees

- projet Supabase preprod actif
- bridge preprod applique
- tables de collaboration presentes
- `memory_text_versions` present
- `billing_documents` present

### Parcours a rejouer a la main

- creation honorer
- creation feter
- creation transmettre
- paiement puis confirmation
- generation initiale du texte
- regeneration du texte
- invitation d'un proche
- claim d'invitation
- depot d'une contribution
- affichage de la contribution dans le dashboard
- publication
- QR public

### Integrations a confirmer

- un vrai email d'invitation part
- un vrai webhook Stripe signe est recu
- la generation IA fonctionne avec les contributions

## 2. Gate production

La production publique ne doit etre ouverte que si le gate testeurs est valide ET si les points suivants sont couverts.

### Exploitation

- une personne responsable Vercel est definie
- une personne responsable Supabase est definie
- une personne responsable Stripe est definie
- une personne responsable Resend est definie
- une procedure de rollback existe
- une procedure incident existe

### Monitoring minimum

- erreurs application Vercel suivies
- erreurs Supabase suivies
- erreurs Stripe webhook suivies
- erreurs Resend suivies
- erreurs generation IA suivies

### Hygiene securite

- secrets verifies et rotates si besoin
- acces Vercel limites
- acces Supabase limites
- acces Stripe limites
- acces Resend limites
- preview non publique si encore en recette

### Hygiene data

- politique de suppression claire
- politique de conservation claire
- acces aux journaux clarifie
- sauvegarde exportable de la base preprod et prod

## 3. Smoke test exact avant ouverture testeurs

### Scenario A - parcours principal

1. Creer un memorial.
2. Passer le paiement.
3. Verifier la confirmation.
4. Generer le texte.
5. Verifier que le dashboard charge.

### Scenario B - collaboration

1. Inviter un proche.
2. Ouvrir le lien d'invitation depuis un second compte.
3. Revendiquer l'acces.
4. Ajouter une contribution.
5. Verifier le log d'activite et la presence de la contribution.

### Scenario C - publication

1. Publier l'espace.
2. Verifier l'URL canonique.
3. Generer le QR.
4. Ouvrir l'URL publique sans etre connecte.

### Scenario D - paiement

1. Rejouer un paiement reel Stripe en preprod.
2. Verifier le webhook.
3. Verifier les statuts en dashboard.

## 4. Rollback minimal

Si la preprod ou la prod se comportent mal:

1. couper l'ouverture testeurs
2. desactiver les parcours les plus sensibles si besoin
3. restaurer la derniere preview stable
4. revenir au dernier jeu de variables stable
5. documenter l'incident avant toute reouverture

## 5. Ce qui reste encore a finir

- nettoyer l'historique principal des migrations Supabase
- terminer la verification reelle Stripe webhook
- terminer la verification reelle Resend
- poursuivre le durcissement des routes encore secondaires
- ajouter de vrais tests end-to-end sur les parcours critiques
