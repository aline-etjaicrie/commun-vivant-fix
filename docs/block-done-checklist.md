# Block Done Checklist

Use this before declaring a block "finished".

## 1. Scope
- Route entrypoints of the block are listed.
- APIs used by the block are listed.
- Shared dependencies are listed (storage keys, adapters, auth helpers).

## 2. Safety
- No new raw localStorage key string was added in UI files.
- No direct cross-block import was added without a clear shared helper.
- API errors return clear status + message.

## 3. Functional Smoke
- Main route loads.
- Primary action completes (submit/generate/save).
- Primary fallback path works (missing data / unauthorized / API failure).

## 4. Data Consistency
- Data keys come from `lib/creationFlowStorage.ts` where relevant.
- Finalization payload goes through `lib/memorialFinalizationAdapter.ts`.
- URL params and context/communType mapping are consistent.

## 5. Exit Criteria
- No TODO needed to make core flow work.
- No known call to missing API route.
- No duplicate file with suffix `" 2"` remains.
