# Audit Collaboration - 2026-03-15

## Corrige dans ce passage

- Le dashboard usager ne liste plus uniquement les espaces "owner". Les espaces partages remontent maintenant aussi dans la charge utile de [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/data/route.ts).
- Chaque memorial visible expose maintenant:
  - `accessRole`
  - `canAdminister`
  - `isOwned`
- L'ecran [page.tsx](/Users/alineweber/Desktop/commun-vivant-clean/app/(user)/espace/memoriaux/page.tsx) adapte ses actions selon le role.
- L'ecran [page.tsx](/Users/alineweber/Desktop/commun-vivant-clean/app/(user)/espace/messages-bougies/page.tsx) ne propose plus la moderation quand l'utilisateur n'a pas les droits.
- Les ecrans medias/video filtrent les memorials qui peuvent lancer une generation a ceux administrables:
  - [page.tsx](/Users/alineweber/Desktop/commun-vivant-clean/app/(user)/espace/medias/page.tsx)
  - [page.tsx](/Users/alineweber/Desktop/commun-vivant-clean/app/(user)/espace/video-hommage/page.tsx)
- L'export PDF QR est maintenant authentifie et verifie les droits dans [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/generate-qr-pdf/route.ts).

## Couverture actuelle des routes sensibles

### Deja proteges par acces collaboratif

- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/memorials/[id]/state/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/memorials/[id]/text/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/memorials/[id]/contributors/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/memorials/[id]/image-themes/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/memorials/[id]/image-energies/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/memorials/[id]/test-unlock/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/user-dashboard/messages/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/videos/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/videos/[id]/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/videos/photos/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/memories/[id]/qr/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/memory-invites/[token]/qr/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/regenerate-text/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/generate-qr-pdf/route.ts)

## Points encore a surveiller

### Routes de generation encore "service-role first"

- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/generate-memorial/route.ts)
- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/generate-memorial-full/route.ts)

Ces routes utilisent encore une logique centree sur la creation/generation et non sur un acces dashboard verifie a chaque appel. C'est tolerable en preprod pour ne pas casser le funnel de creation, mais a revisiter avant prod.

### Worker video

- [route.ts](/Users/alineweber/Desktop/commun-vivant-clean/app/api/videos/[id]/worker/route.ts)

Cette route reste en mode service interne. Elle n'est pas problematique si elle reste strictement appelee par le pipeline serveur, mais elle doit rester hors exposition front directe.

### Ecrans encore largement mockes ou semi-statiques

- [page.tsx](/Users/alineweber/Desktop/commun-vivant-clean/app/dashboard/[id]/personalize/page.tsx)
- [page.tsx](/Users/alineweber/Desktop/commun-vivant-clean/app/dashboard/[id]/publish/page.tsx)
- [page.tsx](/Users/alineweber/Desktop/commun-vivant-clean/app/dashboard/[id]/generate/page.tsx)

Ils ne sont pas les plus critiques pour l'acces collaboratif, mais ils restent a raccorder proprement a l'etat serveur.

## Priorite de suite recommandee

1. Appliquer les migrations preprod Supabase.
2. Valider le flow invitation -> claim -> contribution -> texte.
3. Reprendre la securisation des routes `generate-memorial*`.
4. Raccorder les ecrans dashboard encore trop statiques aux nouvelles APIs.
