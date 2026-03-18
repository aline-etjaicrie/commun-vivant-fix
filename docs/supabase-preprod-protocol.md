# Protocole Supabase Preprod

Ce protocole sert a activer la preprod collaboration sans casser les parcours existants.

## Objectif

Appliquer les migrations de collaboration et de versions de texte, verifier les variables d'environnement, puis rejouer un smoke test minimal sur la preprod.

## Migrations a appliquer

1. [20260314_memory_collaboration.sql](/Users/alineweber/Desktop/commun-vivant-clean/supabase/migrations/20260314_memory_collaboration.sql)
2. [20260315_memory_text_versions.sql](/Users/alineweber/Desktop/commun-vivant-clean/supabase/migrations/20260315_memory_text_versions.sql)

## Variables a verifier en preprod

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `MISTRAL_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ALLOW_MOCK_PAYMENTS`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`

## Application des migrations

### Option A - SQL Editor Supabase

1. Ouvrir le projet preprod dans Supabase.
2. Ouvrir `SQL Editor`.
3. Executer d'abord le contenu de [20260314_memory_collaboration.sql](/Users/alineweber/Desktop/commun-vivant-clean/supabase/migrations/20260314_memory_collaboration.sql).
4. Verifier que les tables suivantes existent:
   - `memory_memberships`
   - `memory_invites`
   - `memory_contributions`
   - `memory_activity_logs`
5. Executer ensuite [20260315_memory_text_versions.sql](/Users/alineweber/Desktop/commun-vivant-clean/supabase/migrations/20260315_memory_text_versions.sql).
6. Verifier que `memory_text_versions` existe.

### Option B - CLI Supabase

1. Lier le projet local au projet preprod.
2. Executer les migrations en ordre.
3. Verifier le schema distant.

Exemple:

```bash
supabase link --project-ref <preprod-ref>
supabase db push
```

## Verifications SQL minimales

Executer ces requetes dans Supabase apres migration:

```sql
select to_regclass('public.memory_memberships');
select to_regclass('public.memory_invites');
select to_regclass('public.memory_contributions');
select to_regclass('public.memory_activity_logs');
select to_regclass('public.memory_text_versions');
```

Chaque requete doit renvoyer le nom de table, pas `null`.

## Smoke test preprod

### Collaboration

1. Se connecter avec un compte proprietaire.
2. Aller sur `/dashboard/<memoryId>/contributors`.
3. Inviter un proche.
4. Verifier:
   - creation de l'invitation
   - affichage du role
   - QR telechargeable
   - envoi email si `RESEND_API_KEY` est configure
5. Ouvrir le lien d'invitation avec le compte invite.
6. Claim l'invitation.
7. Deposer un souvenir.
8. Revenir sur le dashboard proprietaire et verifier:
   - contribution visible
   - activite loggee
   - role present dans le compte collaborateur

### Texte

1. Ouvrir `/dashboard/<memoryId>/text`.
2. Generer ou regenerer le texte.
3. Modifier une phrase manuellement.
4. Verifier:
   - sauvegarde reussie
   - historique present
   - nouvelle entree dans `memory_text_versions`

### QR public

1. Aller sur `/espace/memoriaux`.
2. Telecharger le QR PNG.
3. Exporter le PDF QR.
4. Verifier que l'URL encodee pointe bien vers l'URL publique canonique actuelle, pas un ancien chemin fallback.

### Paiement

1. Lancer un checkout Stripe en preprod.
2. Confirmer que le retour front est correct.
3. Verifier dans Stripe que le webhook `/api/stripe/webhook` est appele.
4. Verifier en base:
   - statut de paiement mis a jour
   - transaction/event log si present

## Points d'attention

- Tant que `RESEND_API_KEY` n'est pas configure, les invitations restent creees mais l'email est marque `skipped`.
- Tant que `STRIPE_WEBHOOK_SECRET` n'est pas configure ou que le webhook Stripe n'est pas branche, la confirmation serveur-first du paiement reste incomplete.
- Les routes de generation publique historiques restent a auditer pour un verrouillage plus fin avant prod.

## Sortie de recette

La preprod peut etre consideree "pre-prod exploitable" si:

1. Les 5 tables existent.
2. Le flow invitation -> claim -> contribution fonctionne.
3. Le texte est versionne.
4. Le QR PNG et le PDF QR sortent bien.
5. Le webhook Stripe a ete rejoue au moins une fois avec une signature valide.
