# VL Deploy and Cutover (Piece 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended for this plan) or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put `apps/vl` in production on `vl.openldr.org.mz`, prove its numbers match cargaviral.openldr.org.mz, move `cargaviral.openldr.org.mz` to it, then retire the legacy frontend and Node backend.

**Architecture:** This is an operations plan; it adds no app code.
- **Hosting:** a new Coolify app on the openldr Coolify instance, configured like the TB Dashboard app, serves `apps/vl` from `main`.
- **DNS:** records for `openldr.org.mz` live in **Vercel DNS**. A wildcard sends every subdomain without its own record to Vercel. Each move is an explicit A record pointing at the Coolify host `94.237.74.73`.
- **Rollback:** reverting one DNS record. The Vercel and Render deployments stay alive until the grace period ends.

**Tech Stack:** Coolify 4 (MCP `coolify-openldr`), Vercel DNS + Vercel hosting (legacy frontend), Render (legacy Node backend `openldr-backend.onrender.com`), Clerk (dev instance `tough-tick-90`, shared with TB), `api_openldr_python` (`tools/vl_parity_check.py`).

**Spec:** `docs/superpowers/specs/2026-10-12-vl-dashboard-migration-design.md` §6 (piece 3) and §7 (risks).

## Who does what

Every step is tagged with its owner:
- **[Claude]:** through the Coolify MCP, `dig`, `curl`, `gh`, or local commands.
- **[User]:** needs your accounts or secrets: Vercel, Clerk, signing in to the dashboards, Coolify secret values, the API users DB, announcements.
- **[Claude→ask]:** Claude can do it, but it is outward-facing or destructive, so Claude asks first, every time.

Claude never reads or prints secret values. The Coolify MCP masks them, and the classifier blocks production env reads.

## Global Constraints (from spec §6)

- **Coolify app:** on the openldr instance, configured like TB. Dockerfile build pack, base dir `/`, Dockerfile `/apps/vl/Dockerfile`, branch `main`, domain `vl.openldr.org.mz`.
- **Environment variables:** only `NEXT_PUBLIC_OPENLDR_API`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `SUGGESTION_EMAILS` and `DASHBOARD_EMAIL`. `NEXT_PUBLIC_*` are build time; secrets are runtime only. Use the same Clerk instance as TB.
- **Side-by-side validation:** run the parity script plus a per-card checklist comparing `vl.openldr.org.mz` with `cargaviral.openldr.org.mz` for the same windows. Differences are allowed only for ✱ items, and the user must sign off.
- **Cutover:** point `cargaviral.openldr.org.mz` at the Coolify app, then announce that sign-in is now required.
- **Retire:** take down the legacy `openldr-frontend` deployment and the Node VL backend after a grace period agreed with the user.

## Known facts (verified 2026-10-13)

| Item | Value |
|---|---|
| Coolify host | `94.237.74.73` (`panel.openldr.org.mz`) |
| Coolify project / environment | "OpenLDR" `fog0c80k8s8kckwocowoko08` / "production" `v08kgscsogk8w8gocg400gcg` |
| Coolify server / destination | `cckg8g0g44844480cc8wo8w4` / `o004g88g88g8o8400k4sk4kw` |
| GitHub app used by TB | "aphl-projects" `e8gkk8gg8g40s8gccoo40swc` |
| TB app (template) | `gow0kwcwokc04wg4wgwk0ws8`: dockerfile, base `/`, `/apps/tb/Dockerfile`, `main`, port 3000, `watch_paths` empty (so every merge to `main` redeploys TB) |
| DNS | Vercel DNS (`ns1/ns2.vercel-dns.com`). Wildcard → Vercel (`216.198.79.x`, `64.29.17.x`). `tb`, `api`, `dev` and `panel` have A records → `94.237.74.73`. |
| `cargaviral.openldr.org.mz` | Served by Vercel (`server: Vercel`, legacy CRA build) |
| `vl.openldr.org.mz` | No record of its own; hits the wildcard and gets a Vercel 404 |
| Legacy Node backend | `https://openldr-backend.onrender.com` (public). It answers `/dash_*` in about 6 s. |
| Production API | `https://api.openldr.org.mz` (Coolify `zjztszetb31cbhzg16gfiazf`, branch `master`, manual deploys) |
| Dev API | `https://dev.openldr.org.mz` (Coolify `x40g8sk4sckcwsw8k4kc88cc`, branch `dev`, auto-deploys) |

## Rulings (decided while writing this plan)

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| D1 | Staging `vl.openldr.org.mz` uses the **production** API (`https://api.openldr.org.mz`). | Side-by-side numbers must come from the same data as cargaviral; production is what users will get. | Piece 1 must reach production before staging (Task 1). |
| D2 | The parity script compares production Python with the **live** Node backend on Render, not a local Node. | The live Node backend is exactly what cargaviral shows, and it is reachable. | Render latency (about 6 s per call) makes a run slow. If Render times out, fall back to local Node (Task 4 Step 2). |
| D3 | After cutover, both domains stay on the Coolify app, with no redirect. | Coolify serves several FQDNs per app natively. A redirect needs custom Traefik labels. Clerk sessions are per domain either way. | Two URLs in use. |
| D4 | The VL app gets `watch_paths`, so merges that touch only TB don't rebuild VL. TB's own `watch_paths` is a separate follow-up and is not changed here. | Changing TB's production config is outside piece 3. | Every VL merge still rebuilds TB, as today. |
| D5 | Lower the TTL on `cargaviral` a day before cutover. Keep the Vercel project and the Render service running through the grace period. | Rollback should be one DNS edit that takes effect within minutes. | Small hosting cost during the grace period. |

## Review Focus

Each failure mode below has a check in the owning task.

1. **The wildcard hijacks `vl`.** Without an explicit A record, `vl` resolves to Vercel and Coolify's Let's Encrypt challenge fails. Check: `dig` returns only `94.237.74.73` before the domain is added (Task 2 Step 3, Task 3 Step 5).
2. **`NEXT_PUBLIC_*` are inlined at build time.** A wrong or missing API URL needs a **rebuild**; a restart doesn't fix it. Check: grep the served JS for the API host (Task 3 Step 7).
3. **Users are locked out at cutover.** People without Clerk accounts, and Admins whose API role isn't `Admin`. Check: an account and role list is confirmed before cutover (Task 5).
4. **Numbers differ after cutover, or the site breaks.** Rollback must be fast and rehearsed. Check: the rollback procedure is written and the TTL lowered before the switch (Task 6 Steps 1–2).
5. **A merge to `main` redeploys TB and VL together.** A broken build would take down both. Check: confirm TB is healthy after each `main` merge in this plan (Task 1 Step 6, Task 3 Step 8).

---

### Task 1: Pre-flight — piece 1 in production, piece 2 merged

**Interfaces:**
- Consumes: api_openldr_python PR #6 and openldr-monorepo PR #15.
- Produces:
  - piece 1 live on `https://api.openldr.org.mz`;
  - `apps/vl` on `main`;
  - a parity report on dev at `scratchpad/parity-dev.txt`.

- [x] **Step 1 [User]: ~~Set `DB_REPORT_DATA` on the dev API app~~ — dropped 2026-10-14**

The weekly reports that read `ReportData.dbo.Resume` are discontinued (user decision, 2026-10-14). Both weekly cards were removed from `apps/vl`, and the parity runs skip the two weekly checks. `DB_REPORT_DATA=ReportData` is set on dev but unused: the API's SQL login cannot open that database (error 4060), and the legacy Render backend hangs on the same endpoints.

- [ ] **Step 2 [Claude→ask]: Merge PR #6 into `dev` and wait for the auto-deploy**

```bash
gh pr merge 6 --repo Association-of-Public-Health-Labs/api_openldr_python --merge
```

Then check the dev deployment with the MCP: `deployment` list for `x40g8sk4sckcwsw8k4kc88cc` should finish with status `finished`.

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dev.openldr.org.mz/hiv/vl/summary/tat_vs_disalinks/
```

Expected: `401`. The endpoint exists and requires auth; a `404` means the deploy didn't land.

- [x] **Step 3 [User + Claude]: Run the parity script against dev** — done 2026-10-14: exit 0, 44 OK, 4 EXPECTED ✱ (clinic rejections), 0 DIFF, weekly checks skipped.

What it took (2026-10-14):
- `/auth/login` takes `username` (e.g. `vagner_pene`) and, for Clerk-created users, the Clerk user id as the password. The token comes back in `token`.
- The API signs and verifies these tokens with `FLASK_SECRET_KEY`. The `JWT_SECRET_KEY` env var is ignored (code bug, follow-up). Dev's `FLASK_SECRET_KEY` had to be replaced with a 32+ byte value. **Production needs the same before Task 4.**
- Run with `python -u` and the weekly checks filtered out (scratchpad `parity_no_weekly.py`), because the weekly reports are discontinued.

[User]: get a Python API token. `POST https://dev.openldr.org.mz/auth/login` with an API username and password, then save `data.token` (or the JWT field the response returns) to `api_openldr_python/token.txt`. Do not paste it into the chat.

[Claude]:

```bash
cd api_openldr_python && git switch dev && git pull
python -m tools.vl_parity_check --node https://openldr-backend.onrender.com \
  --python https://dev.openldr.org.mz --token-file token.txt \
  > /tmp/claude-1000/-home-vagner-Documents-Projects-APHL-openldr/03d6539c-719e-4609-8b67-385563997041/scratchpad/parity-dev.txt 2>&1
echo "exit $?"; tail -40 /tmp/claude-1000/-home-vagner-Documents-Projects-APHL-openldr/03d6539c-719e-4609-8b67-385563997041/scratchpad/parity-dev.txt
```

Expected:
- exit `0`;
- zero `DIFF` lines;
- `EXPECTED` (✱) only on the two clinic rejection checks.

Read each ✱ diff by hand, because the script marks any ✱ difference as expected. Then delete `token.txt`.

If DIFF lines appear, stop. Each one is a piece-1 bug or a data-source mismatch (spec §7: the Python `vl` bind and Node's `VL_DB` may point at different instances). Diagnose with the user before going further.

- [ ] **Step 4 [Claude→ask + User]: Promote `dev` → `master` and deploy production**

[User]: set `DB_REPORT_DATA` on "OpenLDR - API - Production" (`zjztszetb31cbhzg16gfiazf`), the same way as Step 1.

[Claude→ask]:

```bash
gh pr create --repo Association-of-Public-Health-Labs/api_openldr_python --base master --head dev \
  --title "release: VL API parity (piece 1)" --body "Promotes PR #6 (VL API parity) from dev. Parity run on dev: exit 0, see piece-3 plan Task 1.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Merge after the user approves. Then deploy production by hand. It does not auto-deploy.

MCP: `deploy` with `tag_or_uuid: "zjztszetb31cbhzg16gfiazf"` and `wait: true`.

Expected:
- the deployment status is `finished`;
- `curl -s -o /dev/null -w "%{http_code}\n" https://api.openldr.org.mz/hiv/vl/summary/tat_vs_disalinks/` prints `401`;
- tb.openldr.org.mz still loads its Sumário cards. [User] checks this in the browser, because the TB API rides on the same deploy.

- [ ] **Step 5 [User]: Run the PR #15 browser checklist against production data**

Run the dashboard locally against the production API:

```bash
cd openldr-monorepo && git switch feat/vl-dashboard
NEXT_PUBLIC_OPENLDR_API=https://api.openldr.org.mz pnpm --filter=vl dev
```

Work through the "Browser smoke test" list in PR #15, once as Admin and once as non-Admin, and tick it in the PR.

Expected: every box ticked. Any failure goes back as a fix on `feat/vl-dashboard` before merging.

- [ ] **Step 6 [Claude→ask]: Merge PR #15 and check that TB survives the webhook redeploy**

```bash
gh pr merge 15 --repo Association-of-Public-Health-Labs/openldr-monorepo --merge
```

The merge triggers TB's webhook deploy, because TB has no `watch_paths`. MCP: `deployment` list for `gow0kwcwokc04wg4wgwk0ws8`; wait for `finished`.

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://tb.openldr.org.mz/
```

Expected: `307` (redirect to sign-in) or `200`. A `502` or `503` means TB's build broke; roll back from the Coolify deployments list.

---

### Task 2: DNS for the staging host

**Interfaces:**
- Produces: `vl.openldr.org.mz` resolving only to `94.237.74.73`.

- [ ] **Step 1 [User]: Add the A record in Vercel DNS**

Go to Vercel dashboard → Domains → `openldr.org.mz` → DNS Records → Add:
- Name `vl`
- Type `A`
- Value `94.237.74.73`
- TTL `60`

If `vl.openldr.org.mz` is attached to a Vercel *project* as a domain, remove it from that project first. Otherwise Vercel keeps serving it.

- [ ] **Step 2 [User]: Lower the TTL on `cargaviral` now (Ruling D5)**

In the same DNS page:
- If `cargaviral` has an explicit record, set its TTL to `60`.
- If it only resolves through the Vercel project domain (no explicit record), note that. Cutover will then need the domain removed from the Vercel project as well as a new A record (Task 6).

Record which case applies: ______ (explicit record / project-domain only).

- [ ] **Step 3 [Claude]: Verify propagation**

```bash
dig +short vl.openldr.org.mz A
dig +short vl.openldr.org.mz A @1.1.1.1
dig +short vl.openldr.org.mz A @8.8.8.8
```

Expected: all three print exactly `94.237.74.73`, with no `216.198.79.*` or `64.29.17.*`.

---

### Task 3: Create and deploy the Coolify app

**Interfaces:**
- Consumes: Task 1 (`apps/vl` on `main`) and Task 2 (DNS).
- Produces: the Coolify app uuid, recorded here as `VL_APP_UUID = ______`, serving `https://vl.openldr.org.mz`.

- [ ] **Step 1 [Claude→ask]: Create the app, without deploying yet**

MCP `application`:

```json
{
  "action": "create_github",
  "project_uuid": "fog0c80k8s8kckwocowoko08",
  "environment_uuid": "v08kgscsogk8w8gocg400gcg",
  "server_uuid": "cckg8g0g44844480cc8wo8w4",
  "destination_uuid": "o004g88g88g8o8400k4sk4kw",
  "github_app_uuid": "e8gkk8gg8g40s8gccoo40swc",
  "git_repository": "Association-of-Public-Health-Labs/openldr-monorepo",
  "git_branch": "main",
  "build_pack": "dockerfile",
  "base_directory": "/",
  "dockerfile_location": "/apps/vl/Dockerfile",
  "ports_exposes": "3000",
  "name": "VL Dashboard",
  "description": "Portal de Carga Viral (apps/vl)",
  "domains": "https://vl.openldr.org.mz",
  "instant_deploy": false
}
```

Record the returned uuid in `VL_APP_UUID` above.

- [ ] **Step 2 [Claude]: Set `watch_paths` and the health check (Ruling D4)**

MCP `application`:

```json
{
  "action": "update",
  "uuid": "<VL_APP_UUID>",
  "watch_paths": "apps/vl/**\npackages/**\npnpm-lock.yaml\npackage.json\npnpm-workspace.yaml\nturbo.json",
  "health_check_enabled": true,
  "health_check_path": "/sign-in",
  "health_check_return_code": 200
}
```

`/sign-in` is public, so it returns 200 without a session. `/` returns 307.

- [ ] **Step 3 [Claude]: Create the non-secret variables**

MCP `env_vars` on resource `application`, uuid `<VL_APP_UUID>`, action `create`. Create these one at a time:

| key | value | is_buildtime | is_runtime |
|---|---|---|---|
| `NEXT_PUBLIC_OPENLDR_API` | `https://api.openldr.org.mz` | true | true |
| `SUGGESTION_EMAILS` | (copy from TB; done by the User in Step 4) | — | — |
| `DASHBOARD_EMAIL` | (copy from TB; done by the User in Step 4) | — | — |

Only `NEXT_PUBLIC_OPENLDR_API` is created by Claude. Its value is public and baked into the client bundle.

- [ ] **Step 4 [User]: Create the secret and copied variables in the Coolify UI**

Copy each value from the TB Dashboard app. Settings:

| key | is_buildtime | is_runtime |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | ✅ |
| `CLERK_SECRET_KEY` | ⬜ | ✅ |
| `RESEND_API_KEY` | ⬜ | ✅ |
| `SUGGESTION_EMAILS` | ⬜ | ✅ |
| `DASHBOARD_EMAIL` | ⬜ | ✅ |

Do not add any other variable (spec §6.2).

[Claude] then lists the keys and checks the flags; values come back masked:

```
env_vars list resource=application uuid=<VL_APP_UUID>
```

Expected: exactly 6 keys, with flags as in the table.

- [ ] **Step 5 [Claude]: Re-check DNS just before the first deploy**

```bash
dig +short vl.openldr.org.mz A @1.1.1.1
```

Expected: `94.237.74.73` only. If not, wait. Coolify's Let's Encrypt certificate request fails while the wildcard still answers.

- [ ] **Step 6 [Claude]: Deploy**

MCP `deploy` with `tag_or_uuid: "<VL_APP_UUID>"`, `wait: true` and `timeout_seconds: 1200`. The build takes about 5–10 minutes, like TB.

Expected: status `finished`. If it is `failed`, read the returned log tail and fix in the repo. Do not hot-patch the server.

- [ ] **Step 7 [Claude]: Verify the live app**

```bash
curl -sI https://vl.openldr.org.mz/ | grep -iE "^HTTP|^location|^server"
curl -s -o /dev/null -w "%{http_code} %{ssl_verify_result}\n" https://vl.openldr.org.mz/sign-in
curl -s https://vl.openldr.org.mz/sign-in | grep -o '/_next/static/chunks/[^"]*\.js' | head -40 \
  | while read p; do curl -s "https://vl.openldr.org.mz$p"; done | grep -c "api.openldr.org.mz"
```

Expected:
- `/` returns `HTTP/2 307` with `location: /sign-in`, and no `server: Vercel` header;
- `/sign-in` returns `200 0`, meaning the TLS certificate is valid;
- the last count is ≥ 1, so the API URL was baked into the bundle (Review Focus 2). If it is 0, the variable wasn't build-time: fix the flag and redeploy with `force: true`.

MCP `logs` for `<VL_APP_UUID>` should show `Ready` from `next start` and no stack traces.

- [ ] **Step 8 [Claude]: Check that TB is unaffected**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://tb.openldr.org.mz/
```

Expected: `307` or `200`.

---

### Task 4: Side-by-side validation and sign-off

**Interfaces:**
- Consumes: the live VL app (Task 3) and piece 1 in production (Task 1).
- Produces:
  - `docs/vl-cutover/2026-10-signoff.md`, committed in openldr-monorepo, with the user's sign-off;
  - the parity report for production.

- [ ] **Step 1 [User + Claude]: Run the parity script against production**

[User]: put a production API token in `api_openldr_python/token.txt` (from `POST https://api.openldr.org.mz/auth/login`).

[Claude]:

```bash
cd api_openldr_python
PYTHONPATH=. python3 -u <scratchpad>/parity_no_weekly.py --node https://openldr-backend.onrender.com \
  --python https://api.openldr.org.mz --token-file token.txt \
  > /tmp/claude-1000/-home-vagner-Documents-Projects-APHL-openldr/03d6539c-719e-4609-8b67-385563997041/scratchpad/parity-prod.txt 2>&1
echo "exit $?"; rm -f token.txt
```

Expected: exit `0` and zero `DIFF`, with the same ✱ set as on dev.

- [ ] **Step 2 [Claude]: Fallback if Render times out**

Only needed if Step 1 fails with connection or timeout errors on the Node side. Run the Node backend locally, pointed at the same production databases. [User] supplies `openldr-backend/.env`. Then rerun Step 1 with `--node http://localhost:4444`.

```bash
cd openldr-backend && yarn install && yarn dev
```

- [ ] **Step 3 [Claude]: Create the sign-off checklist**

Create `docs/vl-cutover/2026-10-signoff.md` in openldr-monorepo with this content:

````markdown
# VL cutover sign-off

- Window A: 2025-01-01 → 2025-12-31 (closed year). Window B: 2025-10-01 → 2025-12-31 (quarter).
- Legacy: https://cargaviral.openldr.org.mz — New: https://vl.openldr.org.mz (production API)
- Parity script (production): exit __, DIFF __, EXPECTED __ (see notes)
- ✱ allowed differences: rejection = OR of both codes with inclusive end date (clinic rejection cards); no 90-day TAT cap (identical in practice); month labels `Out/25`; status tiles have no trend arrow. The two weekly cards (Relatório Semanal, ReportData) are discontinued and not compared.

| # | Page | Card | Check (window A unless noted) | Legacy | New | Match / ✱ |
|---|---|---|---|---|---|---|
| 1 | Sumário | Status tiles | Nº de amostras · Supressão % · Tempo de resposta (default window, same day) | | | |
| 2 | Sumário | Supressão Viral | % for 3 months | | | |
| 3 | Sumário | Média da Supressão Viral (map) | % for Gaza, Nampula, Maputo Cidade | | | |
| 4 | Sumário | TRL médio Nacional | 4 segments for 1 month | | | |
| 5 | Sumário | TRL vs Disalinks | 17S1 and 20S1 | | | |
| 6 | Sumário | Resumo de Indicadores | 5 rows, January | | | |
| 7 | Lab | Testadas por Lab | 3 labs, CV<1000 / >1000 | | | |
| 8 | Lab | Testadas por mês | 2 months, filter Jose Macamo | | | |
| 9 | Lab | TRL por Lab | 2 labs | | | |
| 10 | Lab | TRL por mês | 2 months | | | |
| 11 | Lab | Rejeitadas por Lab | 3 labs | | | |
| 12 | Lab | Rejeitadas por mês | 2 months | | | |
| 13 | Clinic | Registadas por Província | 3 provinces; drill Gaza → 2 districts | | | |
| 14 | Clinic | Testadas por Província | 3 provinces | | | |
| 15 | Clinic | Testadas por Província/sexo | 2 provinces, 4 series | | | |
| 16 | Clinic | Testadas por Província/mês (sexo) | 2 months | | | |
| 17 | Clinic | TRL por Província/mês | 2 months | | | |
| 18 | Clinic | TRL por Província | 2 provinces | | | |
| 19 | Clinic | Testadas por idade (15–49) | 3 provinces | | | |
| 20 | Clinic | Mulheres Grávidas | 3 provinces | | | |
| 21 | Clinic | Mulheres Lactantes | 3 provinces | | | |
| 22 | Clinic | Testadas por Motivo | 3 slices | | | |
| 23 | Clinic | Rejeitadas por Província/mês | 2 months | | | ✱ |
| 24 | Clinic | Rejeitadas por Província | 3 provinces | | | ✱ |
| 25 | Pacientes | Patient export | One facility from card 14 drill-down (window B): legacy patient Excel row count vs new dialog count | | | |

Sign-off: ______________________ (name) — date ____ — "numbers match except ✱ items"
````

- [ ] **Step 4 [User]: Fill in the checklist**

Open both sites side by side with the same window. Fill in Legacy, New and Match for all 25 rows. For any unexplained difference, stop and ask Claude to investigate before signing.

- [ ] **Step 5 [Claude→ask]: Commit the signed checklist via a PR**

```bash
cd openldr-monorepo && git switch main && git pull && git switch -c docs/vl-cutover-signoff
git add docs/vl-cutover/2026-10-signoff.md
git commit -m "docs: VL cutover sign-off checklist

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then push and open a PR to `main` after the user approves. Use `gh api` with an explicit `head`, because the local `origin` URL is stale (see the remote-transfer memory note). This PR touches only docs; it triggers the TB and VL webhooks, but `watch_paths` keeps VL from rebuilding.

---

### Task 5: Accounts, roles and announcement (before cutover)

**Interfaces:**
- Produces: a cutover date, a list of users with Clerk accounts, Admins confirmed in the API users DB, and the announcement text.

- [ ] **Step 1 [User]: Pick the cutover date and grace period**

Record them:
- Cutover date/time (low-traffic hour): ______
- Grace period before retiring the legacy deployments: ______ (suggested: 30 days)

- [ ] **Step 2 [User]: Prepare accounts**

Today, cargaviral is public. After cutover, everyone must sign in.
- Compile the list of known users: provincial focal points, labs, MISAU/INS.
- In the Clerk dashboard (instance `tough-tick-90`), invite each user, or confirm that self sign-up is enabled.
- Users who sign in through Clerk are created in the API users DB with role `user` by the `/auth/clerk` webhook.

- [ ] **Step 3 [User]: Confirm Admins**

For each person who needs patient data, set `role = 'Admin'`, exact case, in the API users table `openldr_api_user_users`. Do this after their first sign-in, once the row exists.

Verify: that person signs in to `vl.openldr.org.mz` and sees "Pacientes" in the nav (Review Focus 3).

- [ ] **Step 4 [User]: Send the announcement**

Send it at least 3 working days before cutover. Draft (Portuguese):

> **Assunto: Portal de Carga Viral — novo acesso a partir de <data>**
>
> A partir de <data>, o Portal de Carga Viral (cargaviral.openldr.org.mz) passa a exigir início de sessão. Os números e gráficos mantêm-se; o portal ganha exportação para Excel e imagem em todos os cartões. Para obter acesso, aceite o convite enviado para o seu e-mail ou registe-se em https://cargaviral.openldr.org.mz/sign-up. Pode experimentar já em https://vl.openldr.org.mz. Dúvidas: <contacto>.

---

### Task 6: Cutover of `cargaviral.openldr.org.mz`

**Interfaces:**
- Consumes: the sign-off (Task 4), accounts (Task 5), and the lowered TTL (Task 2 Step 2).
- Produces: `cargaviral.openldr.org.mz` served by the VL Coolify app.

- [ ] **Step 1 [Claude]: Write down the rollback before touching anything (Review Focus 4)**

Rollback: in Vercel DNS, delete the `cargaviral` A record `94.237.74.73`, then re-attach `cargaviral.openldr.org.mz` to the legacy Vercel project if it was removed from it. Propagation is about 1 minute (TTL 60). Nothing else changes: the Vercel deployment and the Render backend stay running until Task 8.

Copy that sentence into the cutover message to the user, so it is on screen during the switch.

- [ ] **Step 2 [Claude]: Check the TTL took effect**

```bash
dig cargaviral.openldr.org.mz A @1.1.1.1 | grep -A2 "ANSWER SECTION"
```

Expected: TTL ≤ 60 if `cargaviral` has an explicit record. If it is project-domain only (Task 2 Step 2), skip this check.

- [ ] **Step 3 [User]: Switch DNS at the agreed time**

In Vercel:
1. Remove `cargaviral.openldr.org.mz` from the legacy Vercel project's Domains, if it is attached there.
2. Add or replace the DNS record: Name `cargaviral`, Type `A`, Value `94.237.74.73`, TTL `60`.

- [ ] **Step 4 [Claude]: Wait for propagation**

```bash
for r in 1.1.1.1 8.8.8.8; do dig +short cargaviral.openldr.org.mz A @$r; done
```

Expected: only `94.237.74.73`, from both resolvers.

- [ ] **Step 5 [Claude]: Add the domain to the app and redeploy**

MCP `application` update, `uuid` `<VL_APP_UUID>`, with `domains: "https://vl.openldr.org.mz,https://cargaviral.openldr.org.mz"`. Then MCP `deploy` with `tag_or_uuid` `<VL_APP_UUID>` and `wait: true`. The redeploy refreshes the Traefik labels and requests the new certificate.

- [ ] **Step 6 [Claude]: Verify**

```bash
curl -sI https://cargaviral.openldr.org.mz/ | grep -iE "^HTTP|^location|^server"
curl -s -o /dev/null -w "%{http_code} %{ssl_verify_result}\n" https://cargaviral.openldr.org.mz/sign-in
```

Expected:
- `307` → `/sign-in`, and no `server: Vercel` header;
- `/sign-in` returns `200 0`.

- [ ] **Step 7 [User]: Live check on the real domain**

On https://cargaviral.openldr.org.mz, sign in as Admin. Check:
- the Sumário cards load;
- one drill-down works;
- one Excel export and one PNG export work.

Then sign in as a non-Admin and confirm there is no Pacientes item.

If anything is wrong, run the rollback from Step 1.

---

### Task 7: Watch the first days

- [ ] **Step 1 [Claude]: Check logs daily for 3 days**

MCP `logs` for `<VL_APP_UUID>` (VL errors) and for `zjztszetb31cbhzg16gfiazf` (API 5xx on `/hiv/vl/`).

Expected: no repeated stack traces. If 5xx errors from `/hiv/vl/` recur, open an issue in api_openldr_python and tell the user.

- [ ] **Step 2 [User]: Collect user feedback**

Gather what comes in through "Dúvidas e Sugestões" emails and by direct contact. Missing accounts or roles are handled with Task 5 Steps 2–3.

---

### Task 8: Retire the legacy deployments (after the grace period)

Every step here is destructive or outward-facing. Each needs explicit user confirmation at the time it happens.

- [ ] **Step 1 [User]: Confirm the grace period has ended and no rollback was needed**

- [ ] **Step 2 [User]: Remove the Vercel deployment of `openldr-frontend`**

Remove the Vercel project, or pause it (Vercel project settings).

Verify the wildcard no longer serves the old app:

```bash
curl -sI https://zzz-check.openldr.org.mz | head -3
```

Expected: a Vercel 404. This is harmless, and nothing serves the legacy app.

- [ ] **Step 3 [User]: Suspend the Render service `openldr-backend`**

Use Render dashboard → Suspend; don't delete yet. Check first whether anything else calls it. The legacy COVID dashboard is out of scope (spec §1), but it may still call it.

Verify:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://openldr-backend.onrender.com/dash_tat_vs_disalinks
```

Expected: not `200`.

- [ ] **Step 4 [Claude→ask]: Archive the legacy repos**

```bash
gh repo archive Association-of-Public-Health-Labs/openldr-frontend --yes
gh repo archive Association-of-Public-Health-Labs/openldr-backend --yes
```

Run each only after the user confirms that repo. Archiving is reversible from GitHub settings.

- [ ] **Step 5 [Claude]: Update the docs**

In the workspace `CLAUDE.md` (`/home/vagner/Documents/Projects/APHL/openldr/CLAUDE.md`, not in git):
- mark `openldr-backend` and `openldr-frontend` as **Retired (<date>)**;
- under Migration Plan, change "HIV Viral Load migration" to **Completed**.

In openldr-monorepo `CLAUDE.md`, change the `apps/vl` Deploy line to `cargaviral.openldr.org.mz` + `vl.openldr.org.mz` (Coolify `<VL_APP_UUID>`). Commit on a docs branch, then open a PR after the user approves.

---

## Follow-ups (not in this plan)

- Set `watch_paths` on the TB app (`apps/tb/**`, `packages/**`, lockfile and root config), so VL-only merges stop redeploying TB.
- Move both dashboards from the Clerk **dev** instance to a production instance.
- Fix the TB type check against `csstype` 3.2, then drop the hand-pinned lockfile constraint (ledger R-d of piece 2).
- The shared `FacilitiesPopup` fetches from `https://api-ts.openldr.org.mz` (legacy openldr-api); it needs a replacement before that API is retired.
- Add a backend `/auth/me` endpoint to replace the Admin probe.

## Self-review notes

Spec §6 coverage:

| Spec item | Where |
|---|---|
| 6.1 app | Task 3 |
| 6.2 env vars (exact list, build-time vs runtime) | Task 3 Steps 3–4 |
| 6.3 side-by-side + sign-off | Task 4 |
| 6.4 cutover + announcement | Tasks 5–6 |
| 6.5 retire after an agreed grace period | Tasks 5 Step 1 and 8 |

Spec §7 risks:

| Risk | Where |
|---|---|
| data-source mismatch | Task 1 Step 3 stop rule |
| ReportData columns | dropped: weekly reports discontinued (Task 1 Step 1) |
| users lose access | Task 5 |
| unknown legacy hosting and DNS | resolved: Vercel DNS + Vercel hosting + Render, Known facts table |
