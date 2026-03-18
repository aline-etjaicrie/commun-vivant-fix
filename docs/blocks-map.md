# Blocks Map

## Goal
Work on one block at a time without breaking others.

## Global Rules
- Keep shared keys/constants in `lib/creationFlowStorage.ts`.
- Keep cross-flow payload mapping in `lib/memorialFinalizationAdapter.ts`.
- Avoid adding new raw localStorage keys directly in pages/components.
- For each new user/pro action, prefer a dedicated API route under `app/api/...`.

## Block 1: Home + Design System
- Entry routes: `app/(public)/page.tsx`, `app/layout.tsx`
- Shared UI: `components/Header.tsx`
- Global styles: `app/globals.css`, `tailwind.config.js`
- Memorial visual themes: `lib/templates.ts`

## Block 2: Alma
- Main route: `app/(creation)/create/alma/page.tsx`
- Dev isolated route: `app/(creation)/alma-dev/page.tsx`
- Core chat UI: `components/AlmaChat.tsx`
- Preview + pay:
  - `app/(creation)/alma/preview/page.tsx`
  - `app/(creation)/alma/confirmation/page.tsx`
  - `app/(creation)/alma/pricing/page.tsx`
- APIs: `app/api/alma/*`, `app/api/generate-preview/route.ts`

## Block 3: Questionnaire
- Main route: `app/(creation)/create/questionnaire/page.tsx`
- Dev isolated route: `app/(creation)/questionnaire-dev/page.tsx`
- Steps config: `app/(creation)/create/questionnaire/steps.ts`
- Step rendering: `components/Step.tsx`, `components/Progress.tsx`
- Isolation keys: `lib/almaQuestionnaireIsolation.ts`

## Block 4: Final Generation
- Media step: `app/(creation)/medias/page.tsx`
- Generate step: `app/(creation)/dashboard/generate/page.tsx`
- Validate step: `app/dashboard/[id]/validate/page.tsx`
- APIs: `app/api/generate-memorial/route.ts`, `app/api/generate-memorial-full/route.ts`

## Block 5: User Dashboard
- UI shell: `components/user-dashboard/UserDashboardShell.tsx`
- User pages: `app/(user)/espace/*`
- Data hook: `lib/user-dashboard/useUserDashboard.ts`
- APIs:
  - `app/api/user-dashboard/data/route.ts`
  - `app/api/user-dashboard/messages/route.ts`
  - `app/api/user-dashboard/memorials/[id]/state/route.ts`
  - `app/api/user-dashboard/memorials/[id]/test-unlock/route.ts`
  - `app/api/user-dashboard/memorials/[id]/image-themes/route.ts`

## Block 6: Pro Dashboard
- Pro layout: `app/(pro)/pro/layout.tsx`
- UI shell: `components/pro/ProShell.tsx`
- Pro pages: `app/(pro)/pro/*`
- Store: `lib/pro/store.ts`
- APIs:
  - `app/api/pro/context/route.ts`
  - `app/api/pro/dashboard/route.ts`
  - `app/api/pro/team/route.ts`
  - `app/api/pro/memorials/[id]/access/route.ts`
  - `app/api/pro/memorials/[id]/test-unlock/route.ts`

## Video Block (depends on User Dashboard)
- UI: `app/(user)/espace/video-hommage/page.tsx`, `app/(user)/espace/medias/page.tsx`
- APIs:
  - `app/api/videos/route.ts`
  - `app/api/videos/[id]/route.ts`
  - `app/api/videos/photos/route.ts`
