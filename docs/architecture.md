# Architecture (Current)

## 1) Routing Strategy

The project uses Next.js App Router with route groups (URL stays unchanged):

- `app/(public)`:
  - marketing, legal, examples, template
- `app/(creation)`:
  - creation flow: Alma, questionnaire, medias, generation start
- `app/(user)`:
  - end-user dashboard (`/espace/*`)
- `app/(pro)`:
  - pro dashboard (`/pro/*`, `/dashboard-pro/*`)
- `app/api`:
  - all backend endpoints (kept outside route groups)

Root shared shell:
- `app/layout.tsx`: global layout + header injection
- `app/globals.css`: global styles/utilities

## 2) Domain Breakdown

### Public Web
- `app/(public)/page.tsx`: homepage
- `app/(public)/a-propos`, `faq`, `tarifs`, etc.: static content pages
- `app/(public)/exemple/*`: public examples

### Creation Flow
- `app/(creation)/create/*`: questionnaire/main create paths
- `app/(creation)/alma/*`: Alma preview/pricing/confirmation
- `app/(creation)/alma-dev/*`: isolated Alma dev flow
- `app/(creation)/questionnaire-dev/*`: isolated questionnaire dev flow
- `app/(creation)/medias/page.tsx`: media step
- `app/(creation)/dashboard/generate/page.tsx`: text generation trigger

### User Dashboard
- `app/(user)/espace/*`: user workspace
- `components/user-dashboard/UserDashboardShell.tsx`: user shell
- `lib/user-dashboard/useUserDashboard.ts`: user data/actions hook
- `app/api/user-dashboard/*`: user dashboard APIs

### Pro Dashboard
- `app/(pro)/pro/*`: pro workspace
- `components/pro/ProShell.tsx`: pro shell
- `lib/pro/store.ts`: pro state/actions hook
- `app/api/pro/*`: pro APIs

## 3) Shared Core

### Cross-flow storage keys/helpers
- `lib/creationFlowStorage.ts`
  - `STORAGE_KEYS`
  - `getQuestionnaireDataRaw`
  - `getFinalizationRaw`
  - `getAnyAlmaConversationRaw`

### Finalization payload bridge
- `lib/memorialFinalizationAdapter.ts`
  - questionnaire/alma -> common finalization payload
  - persistence key routing (prod/dev)

### Commun type system
- `lib/communTypes.ts`
  - source of truth for communType/context mapping

### Visual templates
- `lib/templates.ts`
  - memorial visual template definitions

## 4) API Structure

### AI / Content
- `app/api/alma/*`
- `app/api/generate-preview/route.ts`
- `app/api/generate-memorial/route.ts`
- `app/api/generate-memorial-full/route.ts`

### User dashboard
- `app/api/user-dashboard/data/route.ts`
- `app/api/user-dashboard/messages/route.ts`
- `app/api/user-dashboard/memorials/[id]/state/route.ts`
- `app/api/user-dashboard/memorials/[id]/test-unlock/route.ts`
- `app/api/user-dashboard/memorials/[id]/image-themes/route.ts`

### Pro dashboard
- `app/api/pro/context/route.ts`
- `app/api/pro/dashboard/route.ts`
- `app/api/pro/team/route.ts`
- `app/api/pro/memorials/[id]/access/route.ts`
- `app/api/pro/memorials/[id]/test-unlock/route.ts`

### Video
- `app/api/videos/route.ts`
- `app/api/videos/[id]/route.ts`
- `app/api/videos/photos/route.ts`

## 5) Practical Rule to Avoid Breakage

When finishing one block:
- edit only its route group + related APIs
- keep shared changes limited to `lib/creationFlowStorage.ts` and/or `lib/memorialFinalizationAdapter.ts`
- verify no cross-block imports from page files
