# Portal de Carga Viral (`apps/vl`)

HIV Viral Load dashboard, replacing cargaviral.openldr.org.mz. All data comes from
`api_openldr_python` (`/hiv/vl/*`). Spec: `docs/superpowers/specs/2026-10-12-vl-dashboard-migration-design.md`.

```bash
cp .env.example .env.local   # fill in values; NEXT_PUBLIC_OPENLDR_API must serve the piece-1 VL endpoints
pnpm --filter=vl dev
pnpm --filter=vl test        # Vitest, node environment: lib/vl and card actions only
```

Pages: Sumário `/`, Laboratório `/lab`, Província/Distrito/US `/clinic`, Pacientes `/patients` (Admin).
Admin status is probed from the API (`lib/vl/admin.tsx`), never taken from Clerk metadata.
Each card lives in `app/(dashboard)/<page>/reports/<slug>/` with `index.tsx`, `actions.ts`,
`constants.ts`, `docs.tsx` and `actions.test.ts`. Shared logic is in `lib/vl/`.
