# Route Groups

The app now uses Next.js route groups to isolate workstreams without changing URLs.

## Active Groups
- `app/(public)`:
  - `/`
  - static marketing/legal pages (`/a-propos`, `/faq`, `/tarifs`, etc.)
  - examples/templates (`/exemple/*`, `/template`)
- `app/(creation)`:
  - `/create/*`
  - `/alma*`
  - `/questionnaire-dev*`
  - `/medias`
  - `/dashboard/generate`
- `app/(user)`:
  - `/espace*`
  - `/espace-pro`
- `app/(pro)`:
  - `/pro*`
  - `/dashboard-pro*`

## Why
- Keep each product surface independent in filesystem.
- Reduce accidental cross-block edits.
- Prepare clean extraction to mini-apps later.

## Constraints
- Do not move `app/api/*` into groups.
- Keep shared libs in `lib/*` and avoid importing page files across blocks.
- Keep URL-compatible route paths (groups must not change route output).
