# Prod Cutover Runbook

## Objectif

Faire une bascule en production sans improvisation.

## Avant la bascule

Verifier:

- build ok
- lint ok
- smoke tests preprod ok
- webhook Stripe teste
- Resend teste
- secrets prod verifies

## Freeze

Avant ouverture prod:

1. geler les changements de code
2. geler les changements de schema
3. confirmer la version a deployer

## Variables a verifier en prod

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

## Sauvegarde minimum

Avant bascule:

1. export schema Supabase
2. export data critique si possible
3. noter la derniere preview stable
4. noter la derniere version de variables stable

## Bascule

1. deployer la version retenue
2. verifier que le domaine prod pointe bien
3. verifier `robots.txt`
4. verifier `sitemap.xml`
5. verifier le webhook Stripe

## Smoke test prod immediat

Faire tout de suite:

1. ouvrir home
2. ouvrir un parcours creation
3. tester connexion
4. tester dashboard
5. tester URL publique existante
6. tester QR existant

## Rollback

Si un incident bloque la prod:

1. revenir a la derniere version stable
2. remettre les variables stables si besoin
3. couper temporairement l'ouverture publique
4. documenter l'incident

## Go / No-Go final

Le `Go` prod n'est valide que si:

- pas de bloquant sur paiement
- pas de bloquant sur publication
- pas de fuite de donnees
- pas de bug d'acces roles
