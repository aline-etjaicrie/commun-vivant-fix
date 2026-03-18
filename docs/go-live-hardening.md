# Go-Live Hardening

## Niveau actuel

Le projet est maintenant beaucoup plus solide qu'au depart:

- build et lint passent
- collaboration et historique de texte existent en preprod
- plusieurs routes dashboard sensibles sont protegees par roles
- la generation de texte a ete resserree:
  - [generate-memorial](/Users/alineweber/Desktop/commun-vivant-clean/app/api/generate-memorial/route.ts)
  - [generate-memorial-full](/Users/alineweber/Desktop/commun-vivant-clean/app/api/generate-memorial-full/route.ts)
- le funnel paiement -> generation utilise maintenant soit:
  - une session authentifiee
  - soit une session Stripe payee rattachee au bon `memoryId`

Pour le pilotage operatif:

- [go-live-checklist.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/go-live-checklist.md)
- [supabase-preprod-protocol.md](/Users/alineweber/Desktop/commun-vivant-clean/docs/supabase-preprod-protocol.md)

## Pre-requis obligatoires avant testeurs externes

1. Verifier toutes les variables de preprod:
   - Supabase
   - Stripe
   - Resend
   - `NEXT_PUBLIC_SITE_URL`
2. Lancer un test manuel complet sur:
   - creation
   - paiement
   - generation
   - invitation
   - contribution
   - publication
3. Confirmer le webhook Stripe avec un vrai evenement signe.
4. Confirmer qu'un email d'invitation part bien avec Resend.
5. Garder la preview protegee tant que la recette complete n'est pas terminee.

## Pre-requis obligatoires avant vraie production

1. Nettoyer l'historique Supabase principal pour ne plus dependre durablement du bridge preprod.
2. Fermer ou revoir les derniers flux encore trop permissifs autour du checkout anonyme si vous visez un niveau de securite eleve.
3. Ajouter une vraie supervision:
   - erreurs serveur
   - erreurs webhook
   - erreurs generation IA
4. Prevoir une procedure de rollback:
   - code
   - variables d'environnement
   - base
5. Definir qui a acces a:
   - Vercel
   - Supabase
   - Stripe
   - Resend

## Ce qu'il reste a renforcer

### Important

- Controle d'acces plus fin sur le checkout si vous voulez eviter toute reutilisation arbitraire d'un `memoryId`.
- Smoke tests reels multi-comptes en preprod.
- Rotation/verification des secrets et des domaines emails.

### Souhaitable

- Rate limiting sur certaines routes publiques ou couteuses.
- Journalisation securite centralisee.
- Tests end-to-end automatiques sur les parcours critiques.

## Feu vert testeurs

Le feu vert testeurs est raisonnable si:

1. le webhook Stripe est valide,
2. les emails d'invitation sont valides,
3. les parcours multi-contributeurs passent a la main,
4. la preview reste controlee.

## Feu vert prod

Le feu vert prod est raisonnable si:

1. les pre-requis testeurs sont valides,
2. l'historique Supabase principal est assaini,
3. le monitoring est en place,
4. un plan de reponse incident existe.
