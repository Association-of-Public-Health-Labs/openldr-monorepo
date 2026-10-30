# Portal de Carga Viral (`apps/vl`)

HIV Viral Load dashboard, replacing cargaviral.openldr.org.mz. All data comes from
`api_openldr_python` (`/hiv/vl/*`). Spec: `docs/superpowers/specs/2026-10-12-vl-dashboard-migration-design.md`.

```bash
cp .env.example .env.local   # configure NEXT_PUBLIC_OPENLDR_API
pnpm --filter=vl dev
pnpm --filter=vl test        # Vitest, node environment: lib/vl and card actions only
```

Pages: Sumário `/`, Laboratório `/lab`, Província/Distrito/US `/clinic`, Pacientes `/patients` (Admin).
Admin status is probed from the API (`lib/vl/admin.tsx`), never taken from Clerk metadata.
Each card lives in `app/(dashboard)/<page>/reports/<slug>/` with `index.tsx`, `actions.ts`,
`constants.ts`, `docs.tsx` and `actions.test.ts`. Shared logic is in `lib/vl/`.

Dúvidas e sugestões usam `POST /hiv/vl/send-suggestion` na API de
`NEXT_PUBLIC_OPENLDR_API`, com o Bearer token da sessão Clerk. `duvida=true`
indica dúvida e `false` indica sugestão. O JSON inclui `content`, `reportTitle`
e os metadados do utilizador. O backend determina os destinatários e o CC.
`NEXT_PUBLIC_OPENLDR_SUGGESTION_PATH` permite substituir o caminho padrão;
não é necessário configurar Resend no frontend para este fluxo. Alterações
às variáveis `NEXT_PUBLIC_*` requerem um novo build da dashboard.
