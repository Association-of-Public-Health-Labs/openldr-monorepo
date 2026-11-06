# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A restricted `apps/admin` dashboard that manages users through the Clerk API and reports dashboard usage, with its permissions enforced in the TB, VL and EID apps and in the API.

**Architecture:** Permissions live in Clerk `publicMetadata` and reach the apps and the API through a session-token claim. The API gains a central permission gate, usage tracking and patient-access logging, all inert until `PERMISSIONS_ENFORCED` is on. `apps/admin` writes to Clerk from server actions and reads reports from the API; enforcement in the other apps ships last.

**Tech Stack:** Flask, SQLAlchemy and pytest (`api_openldr_python`); Next.js 15, `@clerk/nextjs` 6, Tailwind v4, Vitest and the `@repo/design_system` kit (`openldr-monorepo`).

**Spec:** `docs/superpowers/specs/2026-11-05-admin-dashboard-design.md`

## Delivery

| Part | Repo | Branch, from | PR into | Ships at rollout step |
|---|---|---|---|---|
| A: API | `api_openldr_python` | `feat/admin-api`, `origin/dev` | `dev`, then release to `master` | 2 |
| B: Admin app and shared kit | `openldr-monorepo` | `feat/admin-app`, `origin/main` | `main` | 4 |
| C: Enforcement in the apps | `openldr-monorepo` | `feat/access-enforcement`, `origin/main` after B merges | `main` | 5 |
| D: Rollout | none | none | none | all |

Merging to monorepo `main` auto-deploys, so **hold Part C's merge until rollout step 5**.

## Global Constraints

- All UI text is in Portuguese, matching the TB/VL wording.
- Claim name `openldr`, shape `{ "dashboards": ["vl","tb","eid"], "patientData": bool, "admin": bool }`. No or malformed metadata means no access (fail closed).
- Admin primary `#00d0f0`, foreground `#1C252E`, name "Administração", domain `admin.openldr.org.mz`.
- API: follow the MVC pattern; every new endpoint gets Swagger docs and Bearer auth; errors never expose exception text.
- API env flag `PERMISSIONS_ENFORCED`: `"1"` is on, anything else off. While off, access and `/auth/*` behave exactly as today. The `admin` claim checks on `/usage` and `/admin` read endpoints apply regardless of the flag.
- Patient logs never store search terms. The beacon sends the pathname only, never the query string.
- Monorepo: `pnpm install --frozen-lockfile` only, except the one step in Task B3. No generic code copied between apps: put it in `packages/design_system` and import it.
- Secrets are never printed or committed. Owner-only actions (Clerk dashboard, Coolify, DNS, SQL on production, merges) are marked **Owner** and need their go-ahead.
- API baseline: origin/dev already has 22 failing tests (`test_database_config`, `tb_cultura`). Compare against that list, not against zero.

## Review Focus

1. **A token with no claim or a malformed claim** (claim not yet configured, `dashboards` not a list): expect a 403 with enforcement on, never a 500. Test in Task A1.
2. **A cached report requested by a user without that dashboard:** expect a 403 even when the cache holds a fresh entry. Test in Task A1.
3. **An admin changing their own account, or the last admin losing access,** including by toggling admin off on the only other admin: expect a refusal with a Portuguese message. Test in Task B4.
4. **A patient search by name:** the name must appear in no log row, and a beacon on a URL with a query string must send only the path. Tests in Tasks A4 and B2.
5. **An invitation that can't complete:** an email that already has an account or a pending invitation, or an expired or reused invitation link: expect a clear Portuguese message, not a crash. Tests in Tasks B4 and B6.

---

## Part A: API (`api_openldr_python`)

### Task A1: Permission gate

**Files:**
- Create: `utilities/permissions.py`
- Modify: `utilities/controller_helpers.py` (`authenticate_request`)
- Test: `tests/test_permissions.py`

**Interfaces:**
- Produces, in `utilities/permissions.py`:
  - `Permissions` frozen dataclass: `dashboards: frozenset[str]`, `patient_data: bool`, `admin: bool`, `service: bool`
  - `NO_PERMISSIONS: Permissions`
  - `permissions_enforced() -> bool`: `current_app.config` key `PERMISSIONS_ENFORCED` first (for tests), otherwise the env var
  - `parse_claim(claims: dict) -> Permissions`
  - `permissions_for_token(claims: dict) -> Permissions`: RS256 tokens via `parse_claim`; HS256 tokens per Task A6
  - `dashboard_for_path(path: str) -> str | None`: `/hiv/vl` to `vl`, `/hiv/eid` to `eid`, `/tb` to `tb`, otherwise `None`
  - `current_permissions() -> Permissions`: from `flask.g.permissions`, `NO_PERMISSIONS` when unset
  - `forbidden_response() -> tuple[dict, int]`: `{"status": "error", "code": 403, "message": "Forbidden"}`, 403
- Consumes: `verify_bearer_token` claims in `authenticate_request`.

- [ ] **Step 1: Write the failing tests**

Parametrise `parse_claim`: a good claim; no `openldr` key; `openldr` as a string; `dashboards` as a string; unknown dashboard ids dropped; `patientData: "yes"` is not `True`. All malformed shapes give `NO_PERMISSIONS`-equivalent values, never an exception.

Parametrise `dashboard_for_path`: `/hiv/vl/summary/x/` is `vl`, `/hiv/eid/x/` is `eid`, `/tb/gx/x/` and `/tb/cultura/x/` and `/tb/send-suggestion` are `tb`, `/dict/x/`, `/usage/events`, `/auth/login` and `/hivex/` are `None`.

Using `tests/test_auth_enforcement.py`'s `make_clerk_token` helpers:
- `test_flag_on_without_dashboard_is_403`
- `test_flag_on_with_dashboard_passes`
- `test_flag_off_without_claim_passes`
- `test_flag_on_no_claim_on_dict_endpoint_passes`
- `test_flag_on_cached_report_without_dashboard_is_403`: seed the cache as `tests/test_report_cache.py` does, and assert 403 with no `X-Report-Cache` header (Review Focus 2)

- [ ] **Step 2: Run them to verify they fail**

Run: `pytest tests/test_permissions.py -v`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement `utilities/permissions.py`, and in `authenticate_request` set `g.permissions = permissions_for_token(token_payload)` after verification, then return `(None, forbidden_response())` when the flag is on and the path's dashboard isn't in `dashboards`**

The check lives inside `authenticate_request`, so `tools/warm_report_cache.py`, which patches that function, is unaffected. For now `permissions_for_token` treats an HS256 token as `NO_PERMISSIONS` (Task A6 completes it).

- [ ] **Step 4: Run the tests**

Run: `pytest tests/test_permissions.py tests/test_auth_enforcement.py tests/test_report_cache.py -v`. Expected: new tests PASS, none of the existing ones regress.

- [ ] **Step 5: Commit**

`git commit -m "feat(auth): permission gate from the Clerk session claim, behind PERMISSIONS_ENFORCED"`

### Task A2: Patient access replaces the Admin role

**Files:**
- Modify: `utilities/permissions.py`, `utilities/auth_helpers.py`, `utilities/service_helpers.py` (`get_user_role`), `hiv/vl/services/vl_services_facilities.py` (`_facility_level_forbidden`), `tb/gxpert/services/tb_gx_services_{facilities,laboratories,summary}.py`, `tb/cultura/services/tb_cultura_services_common.py`
- Create: `docs/2026-11-05-role-check-audit.md`
- Test: `tests/test_patient_access.py`

**Interfaces:**
- Produces: `patient_access_role(user) -> str` in `permissions.py`. Flag off: `user.role if user else "Unknown"`. Flag on: `"Admin"` when `current_permissions().patient_data`, else `"User"`, ignoring `user`.

Existing checks compare with `"Admin"`, so swapping the role source leaves their logic and 403 shape alone, and the apps' admin probe now reports patient access without any change.

- [ ] **Step 1: Write the failing tests**

With the flag on, Clerk tokens with and without `patientData`:
- `/hiv/vl/patients/by_name/`, `/hiv/eid/patients/by_name/`, `/tb/gx/patients/by_name/`: 403 without, not 403 with
- TB `health_facility` on `/tb/gx/laboratories/registered_samples/`: 403 without
- VL `facility_type=health_facility` on one facility endpoint: not 403 without `patientData` (the widening decision)
- a user with `role="Admin"` in the DB and no `patientData` claim: 403 on patient endpoints

With the flag off: a DB `Admin` passes and a DB `User` gets 403, as today. VL `health_facility` stays 403 for a DB `User`.

Mock the services' queries as `tests/test_auth_enforcement.py` does.

- [ ] **Step 2: Run them to verify they fail**

Run: `pytest tests/test_patient_access.py -v`. Expected: FAIL.

- [ ] **Step 3: Replace every `user.role if user else "Unknown"` in the listed TB files with `patient_access_role(user)`, and use it in both `get_user_role` helpers**

In `auth_helpers.get_user_role` and `service_helpers.get_user_role`, with the flag on return the role before any DB lookup, so a user with no row or a DB failure still gets a correct answer. `_facility_level_forbidden` returns `None` when the flag is on.

- [ ] **Step 4: Write the audit**

`docs/2026-11-05-role-check-audit.md`: a table of every remaining role use from `git grep -nE 'user_role|require_admin|check_admin_access|_admin_only|\.role'`, each classified aggregate, patient rows or other. Include TB cultura, TB summary and the `"Role"` response fields. If any aggregate endpoint is still restricted, open it per spec §3. If any patient-row route isn't covered by Task A4's `is_patient_request`, extend that function.

- [ ] **Step 5: Run the tests**

Run: `pytest tests/test_patient_access.py tests/hiv tests/tb -v`. Expected: new tests PASS, no new failures beyond the baseline.

- [ ] **Step 6: Commit**

`git commit -m "feat(auth): patient data follows the patientData permission; facility numbers open to dashboard users"`

### Task A3: Usage tables and page-view endpoint

**Files:**
- Create: `usage/__init__.py`, `usage/models.py`, `usage/service.py`, `usage/controller.py`, `usage/routes.py`, `tools/sql/2026-11-05-usage-tables.sql`
- Modify: `app.py`, `tests/conftest.py` (register `usage_routes`)
- Test: `tests/test_usage_events.py`

**Interfaces:**
- Produces:
  - Models with `__bind_key__ = "users"`: `UsageEvent(id, user_id, dashboard, page, occurred_at)`, `PatientAccessLog(id, user_id, dashboard, endpoint, row_count, occurred_at)`, `AdminAuditLog(id, actor_user_id, action, target_user_id, changes, occurred_at)`
  - `POST /usage/events`, JSON `{ "dashboard": "vl", "page": "/lab" }`, returns 204
  - `usage_routes(api)`

The app has no `create_all` or migrations, so the tables come from the SQL script. It must run on SQL Server 2014: no JSON types, `IF OBJECT_ID(...) IS NULL` guards, `changes` as `NVARCHAR(MAX)`. Add indexes on `(occurred_at, dashboard)` and `(user_id, occurred_at)`.

- [ ] **Step 1: Write the failing tests**

- `test_records_event_for_token_user`: the row's `user_id` is the token subject, even if the body sends another `user_id`
- `test_rejects_unknown_dashboard`: 400
- `test_rejects_missing_page`: 400
- `test_page_stripped_of_query_and_truncated`: `/lab?name=Ana` is stored as `/lab`; a 500-character page is cut to 250
- `test_no_token_is_401`
- `test_flag_on_without_dashboard_access_is_403`: a user can only record views of dashboards they can open
- `test_db_failure_returns_204_and_logs`: tracking never surfaces a failure

- [ ] **Step 2: Run them to verify they fail**

Run: `pytest tests/test_usage_events.py -v`. Expected: FAIL.

- [ ] **Step 3: Implement models, `record_page_view(user_id, dashboard, page)`, the controller using `authenticate_request`, the routes and the SQL script**

- [ ] **Step 4: Run the tests**

Run: `pytest tests/test_usage_events.py tests/test_swagger_docstrings.py -v`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(usage): page-view tracking endpoint and usage tables"`

### Task A4: Patient access log

**Files:**
- Modify: `utilities/controller_helpers.py` (`run_reporting_endpoint`), `usage/service.py`
- Test: `tests/test_patient_access_log.py`

**Interfaces:**
- Consumes: `PatientAccessLog`, `dashboard_for_path`.
- Produces: `is_patient_request(path: str, args: dict) -> bool`: `/patients/` in the path, or a `/tb/` path with `facility_type=health_facility`. `log_patient_access(user_id, path, row_count) -> None`.

**Decision for this plan:** if the log write fails, the data is still returned and the failure is logged at error level. A `users` database problem shouldn't stop lab staff looking up a result. Flagged to the owner in the handoff.

- [ ] **Step 1: Write the failing tests**

- `test_successful_patient_search_writes_one_row`: correct user, dashboard, endpoint and row count, for both a list response and a paginated `{data: [...]}` response
- `test_search_term_is_never_stored`: call `/hiv/vl/patients/by_name/?name=ANA_SECRETA` and assert the string appears in no column of the row (Review Focus 4)
- `test_403_writes_no_row`
- `test_aggregate_request_writes_no_row`
- `test_log_failure_still_returns_data`

- [ ] **Step 2: Run them to verify they fail**

Run: `pytest tests/test_patient_access_log.py -v`. Expected: FAIL.

- [ ] **Step 3: In `run_reporting_endpoint`, after a successful service result, call `log_patient_access` when `is_patient_request` is true**

Confirm from the audit that all patient controllers use this pipeline. Any that don't call `log_patient_access` directly.

- [ ] **Step 4: Run the tests**

Run: `pytest tests/test_patient_access_log.py tests/test_report_cache.py tests/test_reporting_errors.py -v`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(usage): log patient data access server-side, without search terms"`

### Task A5: Usage reports and admin history endpoints

**Files:**
- Create: `usage/sessions.py`
- Modify: `usage/service.py`, `usage/controller.py`, `usage/routes.py`, `utilities/permissions.py`
- Test: `tests/test_usage_sessions.py`, `tests/test_usage_reports.py`

**Interfaces:**
- Produces: `require_admin_claim() -> tuple | None` in `permissions.py`. `derive_sessions(events) -> list[Session]`: per user and dashboard, a new session after more than 30 minutes without an event.
- All GET endpoints take `interval_dates` and, except `by_dashboard` and `active_users_by_month`, an optional `dashboard`. All require the `admin` claim regardless of the flag:

| Endpoint | Returns |
|---|---|
| `GET /usage/summary/` | `{active_users, sessions, sessions_per_user, previous: {active_users, sessions}}`; `previous` is the same-length period just before |
| `GET /usage/active_users_by_month/` | `[{year, month, dashboard, active_users}]` |
| `GET /usage/by_dashboard/` | `[{dashboard, active_users, sessions, sessions_per_user}]` |
| `GET /usage/top_users/?limit=10` | `[{user_id, dashboards, sessions, last_visit}]` |
| `GET /usage/top_pages/?limit=5` | `[{dashboard, page, views}]` |
| `GET /usage/patient_access/` | `[{user_id, dashboard, accesses, last_access}]` |
| `POST /admin/audit` | Body `{action, target_user_id, changes}`, actor from the token, returns 201 |

Names aren't returned: `apps/admin` resolves `user_id` through Clerk.

- [ ] **Step 1: Write the failing tests**

`derive_sessions`: events 29 minutes apart are one session; 31 minutes apart are two; the same times on two dashboards are two sessions; two users are separate; empty input gives `[]`.

Reports: seed events, then assert exact numbers for each endpoint. `sessions_per_user` with zero users is `0`, not an error. Each endpoint returns 403 for a non-admin claim, with the flag on or off, and for a service token. `POST /admin/audit` stores the token's subject as actor, ignoring any actor in the body.

- [ ] **Step 2: Run them to verify they fail**

Run: `pytest tests/test_usage_sessions.py tests/test_usage_reports.py -v`. Expected: FAIL.

- [ ] **Step 3: Implement**

Read events for the period and compute sessions in Python. The volume is small, and caching stays out unless it proves slow (spec §5.3).

- [ ] **Step 4: Run the tests**

Run: `pytest tests/test_usage_sessions.py tests/test_usage_reports.py tests/test_swagger_docstrings.py -v`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(usage): admin-only usage reports and admin action history"`

### Task A6: Service accounts and `/auth/*`

**Files:**
- Modify: `utilities/permissions.py`, `auth/auth_service.py`, `auth/auth_controller.py`, `configs/paths.py`
- Create: `tools/create_service_account.py`
- Test: `tests/test_service_accounts.py`

**Interfaces:**
- Produces: `service_account_names() -> frozenset[str]` from `API_SERVICE_ACCOUNTS` (comma separated). `permissions_for_token`: HS256 token whose `user_name` is listed gets all dashboards, `patient_data=False`, `admin=False`, `service=True`; any other HS256 token gets `NO_PERMISSIONS`.

- [ ] **Step 1: Write the failing tests**

With the flag on:
- listed account logs in with its secret and reads a report
- listed account gets 403 on patient endpoints, TB `health_facility` and `/usage/summary/`
- unlisted personal account: `/auth/login` refused with a 401
- old personal HS256 token: 401 on a report endpoint (see Step 3)
- a token of a name removed from the list: 401 straight away
- `/auth/users`, `/auth/create`, `/auth/update`, `/auth/delete`: 410 Gone
- `/auth/clerk` still works

With the flag off: login, those routes and old tokens behave exactly as today, and each login records the caller's IP and user agent in the log.

- [ ] **Step 2: Run them to verify they fail**

Run: `pytest tests/test_service_accounts.py tests/test_clerk_webhook.py -v`. Expected: FAIL.

- [ ] **Step 3: Implement**

- In `authenticate_request`, with the flag on, an HS256 token that isn't a listed service account returns `unauthorized_response()`.
- With the flag on, `login_user_service` looks up by `user_name` only, requires the name to be listed, and checks the secret with `bcrypt` (the old `user_id == password` match stays only for the flag-off path).
- `tools/create_service_account.py NAME`: generates a `secrets.token_urlsafe(48)` secret, stores a bcrypt hash in a new `openldr_api_user_users` row with `user_id` `svc-NAME` and role `service`, and prints the secret once.
- Update the docstrings of `tools/vl_parity_check.py` and `tools/eid_parity_check.py` to say tokens come from a service account.

- [ ] **Step 4: Run the tests**

Run: `pytest tests/test_service_accounts.py tests/test_clerk_webhook.py tests/test_token_verification.py -v`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(auth): limit /auth/login to named service accounts and retire /auth user management"`

### Task A7: Permission migration script

**Files:**
- Create: `tools/migrate_permissions.py`
- Test: `tests/test_migrate_permissions.py`

**Interfaces:**
- Produces: `plan_changes(clerk_users, db_roles, admin_emails) -> list[Change]`, pure. CLI: `--admins FILE` (one email per line), `--apply`. Without `--apply` it prints a summary only and writes nothing.

- [ ] **Step 1: Write the failing tests**

- every user gets all three dashboards
- DB role `Admin` gives `patientData: true`; anything else, or no DB row, gives `false`
- `admin: true` only for listed emails, case-insensitive
- other `publicMetadata` keys are preserved
- **a user who already has `dashboards` is skipped**, so re-running can't undo changes made in the admin dashboard
- an email in the admins file that matches no user is reported

- [ ] **Step 2: Run them to verify they fail**

Run: `pytest tests/test_migrate_permissions.py -v`. Expected: FAIL.

- [ ] **Step 3: Implement `plan_changes` and the CLI**

Page through the Clerk Users API with `CLERK_API_URL` and `CLERK_SECRET_KEY`. Write with `PATCH /users/{id}/metadata`. Print counts and emails only.

- [ ] **Step 4: Run the tests**

Run: `pytest tests/test_migrate_permissions.py -v`. Expected: PASS.

- [ ] **Step 5: Commit, then open the Part A PR into `dev` once all of Part A is green**

`git commit -m "feat(tools): migrate existing users to Clerk permissions, dry run by default"`

---

## Part B: Admin app and shared kit (`openldr-monorepo`)

### Task B1: Registry, access helpers and shared UI

**Files:**
- Create: `packages/design_system/src/lib/access.ts`, `packages/design_system/src/lib/access.test.ts`, `packages/design_system/src/components/ui/switch.tsx`
- Modify: `packages/design_system/src/dashboards.ts`, `dashboards.test.ts`, `styles/theme.css`, `layout/shell-utils.ts`, `layout/shell-utils.test.ts`, `layout/DashboardSwitcher.tsx`, `layout/AccountDrawer.tsx`, `layout/DashboardShell.tsx`
- Modify: `apps/tb`, `apps/vl`, `apps/eid` `app/(dashboard)/layout.tsx` (pass `access`)

**Interfaces:**
- Produces, in `lib/access.ts` (no Clerk or React imports, so it's safe in middleware):
  - `UserAccess = { dashboards: DashboardId[]; patientData: boolean; admin: boolean }`
  - `parseAccess(value: unknown): UserAccess | null`: `null` when absent or malformed
  - `canOpen(access: UserAccess | null, id: DashboardId): boolean`: `admin` needs `access.admin`, others need `id` in `dashboards`; `null` is `false`
- `switcherItems(current, dashboards, production, access?)`. `access` undefined or `null`: all except `admin`, as today. Otherwise only what `canOpen` allows, and always the current one.
- `DashboardShell` gets an optional `access?: UserAccess | null`, passed down to the switcher and drawer.
- `Switch`: `{ checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean; "aria-label"?: string }`, a plain `<button role="switch">`, using `--primary`. No new dependency.

- [ ] **Step 1: Write the failing tests**

`parseAccess`: valid, `undefined`, wrong types, unknown ids dropped. `canOpen`: each case, including `null`. `switcherItems`: admin hidden with no access, hidden for a non-admin, shown for an admin; a user with only `tb` sees only `tb` plus the current one. Registry test: extend the expected lists with `["admin", "#00d0f0", "#1C252E"]`, url `https://admin.openldr.org.mz`.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter=@repo/design_system test`. Expected: FAIL. (Check the package's name in its `package.json` first.)

- [ ] **Step 3: Implement**

- Add `admin` to `DashboardId`, the registry (`name: "Administração"`, `portalTitle: "Administração"`, `ready: false`) and `ENV_OVERRIDES` (`NEXT_PUBLIC_DASHBOARD_URL_ADMIN`).
- Add `[data-dashboard="admin"] { --primary: #00d0f0; --primary-foreground: #1C252E; }` to `theme.css`.
- In the three apps pass `access={parseAccess(user?.publicMetadata)}`.
- Set EID `ready: true` here, since it's live (spec §10).

- [ ] **Step 4: Verify**

Run: `pnpm --filter=@repo/design_system test`, then `pnpm turbo run build --filter=tb --filter=vl --filter=eid`. Expected: PASS and builds succeed.

- [ ] **Step 5: Commit**

`git commit -m "feat(design-system): admin in the registry, access helpers, switcher shows only what a user can open"`

### Task B2: Page-view beacon

**Files:**
- Create: `packages/design_system/src/hooks/report/use-usage-beacon.ts`, `packages/design_system/src/lib/usage-beacon.ts`, `lib/usage-beacon.test.ts`
- Modify: `apps/tb`, `apps/vl`, `apps/eid` `app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `POST /usage/events` (Task A3).
- Produces:
  - `pagePath(pathname: string): string`: drops any query or hash
  - `shouldSend(previous: string | null, next: string): boolean`
  - `sendPageView(opts: { apiBase, token, dashboard, page, fetchFn? }): Promise<void>`: never rejects; uses `keepalive: true`
  - `useUsageBeacon(dashboard: DashboardId, pathname: string, getToken: () => Promise<string | null>): void`

- [ ] **Step 1: Write the failing tests**

- `pagePath("/lab?name=Ana#x")` is `/lab` (Review Focus 4)
- `shouldSend`: same path twice is false; a change is true
- `sendPageView` resolves when `fetch` rejects and when it returns 500
- with no token, nothing is sent

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter=@repo/design_system test`. Expected: FAIL.

- [ ] **Step 3: Implement, and call the hook from each app's `Shell`, with `apiBase` from `NEXT_PUBLIC_OPENLDR_API` and `pathname` from `usePathname()`**

The kit has no Next dependency, so `pathname` is passed in. Don't add the beacon to `apps/admin`.

- [ ] **Step 4: Verify**

Run: `pnpm --filter=@repo/design_system test`, then `pnpm turbo run build --filter=tb --filter=vl --filter=eid`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(usage): page-view beacon in the TB, VL and EID shells"`

### Task B3: Scaffold `apps/admin`

**Files:**
- Create: `apps/admin/*` per the `openldr-dashboard` skill's `references/scaffold-guide.md`, copying VL's skeleton without `app/(auth)/sign-up`, reports, transport, suggestions or `lib/vl`
- Create: `apps/admin/lib/admin/nav.ts`, `lib/admin/server-auth.ts`, `app/sem-acesso/page.tsx`, `lib/admin/access-gate.test.ts`, `middleware.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: `parseAccess`, `canOpen` (Task B1).
- Produces:
  - `gateRedirect(pathname: string, access: UserAccess | null): "/sem-acesso" | null`, pure, exported from `lib/admin/access-gate.ts`
  - `requireAdmin(): Promise<{ userId: string; user: User }>` in `server-auth.ts`: re-reads the caller from `clerkClient()` and checks `publicMetadata.admin`, **not the token**, and that they aren't banned; throws `NotAdminError` otherwise
  - Nav: `Utilização` at `/`, `Utilizadores` at `/users`
- Public routes: `/sign-in(.*)`, `/accept-invite(.*)`, `/sem-acesso`. The app renders `<html data-dashboard="admin">`.

- [ ] **Step 1: Write the failing test for `gateRedirect`**

Admin: `null`. Non-admin and `null` access: `/sem-acesso`. `/sem-acesso` itself: `null`, so there's no redirect loop.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter=admin test`. Expected: FAIL. (Install step below if the workspace isn't known yet.)

- [ ] **Step 3: Implement the scaffold, the gate and `/sem-acesso` ("Sem acesso", with a link to sign out)**

Read `sessionClaims.openldr` in middleware. Sign-in copies VL's without the "Criar uma conta" link.

- [ ] **Step 4: Update the lockfile for the new workspace only**

Run: `pnpm install --lockfile-only`, then `git diff --stat pnpm-lock.yaml`. Expected: only an `apps/admin` importer added. If other packages re-resolve (known `csstype` pitfall), revert the drift, using the same dependency versions as `apps/vl`.

- [ ] **Step 5: Verify**

Run: `pnpm --filter=admin test && pnpm --filter=admin exec tsc --noEmit && pnpm --filter=admin lint && pnpm turbo run build --filter=admin`. Expected: PASS.

- [ ] **Step 6: Commit**

`git commit -m "feat(admin): scaffold the admin app, restricted to admins"`

### Task B4: User logic and server actions

**Files:**
- Create: `apps/admin/lib/admin/users.ts`, `lib/admin/users.test.ts`, `lib/admin/clerk-errors.ts`, `lib/admin/clerk-errors.test.ts`, `app/(dashboard)/users/actions.ts`

**Interfaces:**
- Produces in `users.ts` (pure):
  - `UserRow = { kind: "user" | "invitation"; id; firstName; lastName; email; access: UserAccess; status: "active" | "invited" | "blocked"; lastActiveAt: number | null }`
  - `mergeRows(users, invitations): UserRow[]`, sorted by last name
  - `filterRows(rows, { search?, status?, dashboard?, patientData? }): UserRow[]`
  - `guardChange({ actorId, targetId, targetIsAdmin, nextAdmin, blocking, adminCount }): string | null`: a Portuguese refusal message or `null`
- Produces in `actions.ts`, each starting with `requireAdmin()` and ending with a `POST /admin/audit`:
  - `listUsers(): Promise<UserRow[]>`
  - `inviteUser({ firstName, lastName, email, access }): Promise<ActionResult>`
  - `updateUser(id, { firstName, lastName, email, access }): Promise<ActionResult>`
  - `setBlocked(id, blocked: boolean): Promise<ActionResult>`
  - `resendInvitation(id)`, `revokeInvitation(id)`: `Promise<ActionResult>`
  - `ActionResult = { ok: true } | { ok: false; message: string }`

- [ ] **Step 1: Write the failing tests**

`guardChange` (Review Focus 3):
- actor blocks self: refused
- actor removes own admin: refused
- removing admin from another admin when `adminCount` is 1: refused
- blocking the only admin: refused
- removing admin from another with `adminCount` 2: `null`

`mergeRows`: a user and an invitation both appear, a banned user is `blocked`, a pending invitation is `invited` with its metadata as access. `filterRows`: search is case- and accent-insensitive across name and email; each filter works, alone and combined.

`clerkErrorMessage` (Review Focus 5): `form_identifier_exists` and `duplicate_record` map to a Portuguese "já existe" message; an unknown error maps to a generic Portuguese message and never includes Clerk's text.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter=admin test`. Expected: FAIL.

- [ ] **Step 3: Implement**

Using `clerkClient()` from `@clerk/nextjs/server`:
- `listUsers`: page `users.getUserList({ limit: 500, offset })` until exhausted, plus `invitations.getInvitationList({ status: "pending" })`.
- `inviteUser`: `invitations.createInvitation({ emailAddress, publicMetadata, redirectUrl: <admin>/accept-invite })`. First and last name go in `publicMetadata.invitedName` and pre-fill the accept page.
- `updateUser`: `users.updateUser` for names; `users.updateUserMetadata` for access; for a changed email, `emailAddresses.createEmailAddress({ userId, emailAddress, primary: true, verified: true })`, then delete the old one.
- `setBlocked`: `users.banUser` / `users.unbanUser`.
- `resendInvitation`: revoke, then create again with the same metadata.
- Before a change, compute `adminCount` from a fresh list and call `guardChange`.
- An audit `POST` failure is logged and doesn't undo the change.

- [ ] **Step 4: Verify**

Run: `pnpm --filter=admin test && pnpm --filter=admin exec tsc --noEmit`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(admin): user management actions with guard rails"`

### Task B5: Utilizadores page

**Files:**
- Create: `apps/admin/app/(dashboard)/users/page.tsx`, `users/reports/users-table/index.tsx`, `users/reports/user-panel/index.tsx`, `users/reports/user-panel/form.ts`, `users/reports/user-panel/form.test.ts`

**Interfaces:**
- Consumes: `listUsers` and the other actions, `filterRows` (Task B4), `Switch` (Task B1), `Sheet`, `Input`, `Dialog`, `Table` from `components/ui`.
- Produces: `validateUserForm(values): Record<string, string>`: Portuguese messages per field. Layout per `docs/superpowers/specs/2026-11-05-admin-dashboard-mockups/users-page.html`.

- [ ] **Step 1: Write the failing test**

`validateUserForm`: required first name, last name and email; malformed email; valid passes. A new user with no dashboards passes (an admin may invite first and grant later).

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter=admin test`. Expected: FAIL.

- [ ] **Step 3: Implement**

- Table columns: Nome (with email), Dashboards, Pacientes, Estado, Último acesso (`lastActiveAt`). Search and filters as in the mockup; client-side pagination at 25 rows.
- Status shows an icon and a label, not just colour.
- The panel opens from a row or "+ Novo utilizador", whose button is "Enviar convite". For an invitation it offers "Reenviar convite" and "Revogar convite" instead of Bloquear.
- Bloquear/Desbloquear asks for confirmation in a `Dialog`.
- An `ok: false` result shows its message in the panel and keeps the form's values.

- [ ] **Step 4: Verify in the browser, against the Clerk dev instance and the dev API**

Run: `pnpm --filter=admin dev`. Check: edit, invite, block, unblock, and each guard-rail refusal, at desktop and phone widths. Sign-in needs the dev instance keys; ask the owner to provide `.env.local`.

- [ ] **Step 5: Commit**

`git commit -m "feat(admin): Utilizadores page"`

### Task B6: Accepting an invitation

**Files:**
- Create: `apps/admin/app/accept-invite/page.tsx`, `app/accept-invite/client.tsx`, `lib/admin/invite.ts`, `lib/admin/invite.test.ts`

**Interfaces:**
- Produces: `postInviteUrl(access: UserAccess | null, dashboards: DashboardInfo[]): string`: the URL of the user's first accessible dashboard, the admin app if they only have admin, otherwise `/sem-acesso`. `inviteErrorMessage(code: string): string`.

The current sign-up pages don't handle Clerk's invitation ticket, so this page does, in one place.

- [ ] **Step 1: Write the failing tests**

`postInviteUrl`: `["tb"]` goes to TB; none with admin goes to admin; none and no admin goes to `/sem-acesso`. `inviteErrorMessage` (Review Focus 5): expired or revoked ticket, and already-used ticket, each give a Portuguese message telling the user to ask for a new invitation.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter=admin test`. Expected: FAIL.

- [ ] **Step 3: Implement**

Read `__clerk_ticket` from the URL and show first name, last name and password. Call `signUp.create({ strategy: "ticket", ticket, firstName, lastName, password })`, then `setActive`, then redirect with `postInviteUrl`. With no ticket in the URL, show a message rather than a form.

- [ ] **Step 4: Verify on the Clerk dev instance**

Invite a test address from the Users page, follow the email link and set a password. Expected: signed in on the right dashboard, and the row moves to "Activo". Then reuse the link. Expected: the Portuguese message.

- [ ] **Step 5: Commit**

`git commit -m "feat(admin): accept-invitation page"`

### Task B7: Utilização page

**Files:**
- Create: `apps/admin/config/api.ts`, `lib/admin/usage.ts`, `lib/admin/usage.test.ts`, `app/(dashboard)/(index)/page.tsx`, and `app/(dashboard)/(index)/reports/{usage-kpis,active-users-by-month,by-dashboard,top-users,top-pages,patient-access}/` in the VL card folder style (`index.tsx`, `actions.ts`, `actions.test.ts`, `constants.ts`, `docs.tsx`)
- Modify: `app/(dashboard)/users/actions.ts` (add `resolveUsers`, `countInactive`)

**Interfaces:**
- Consumes: the `/usage/*` endpoints (Task A5), `KpiCard`, `MainCard`/`ReportCard`, kit `Line` chart, report hooks.
- Produces: `resolveUsers(ids: string[]): Promise<Record<string, { name: string; email: string }>>` and `countInactive(days = 90): Promise<number>`, both after `requireAdmin()`.

"Utilizadores inactivos" and "Último acesso" use Clerk's `last_active_at` throughout, which needs no separate tracking history and so simplifies spec §4.1.

- [ ] **Step 1: Write the failing tests**

Per card's `actions.test.ts` and `usage.test.ts`:
- trend `+8%` from `{142, previous 131}`; no previous value gives no trend, not `Infinity`
- monthly rows pivot to one series per dashboard, with months with no data as `null` (a line starts when tracking began), labelled per registry name and colour
- `countInactive`-style logic: a user with `last_active_at` null counts as inactive
- an unresolved `user_id` displays as "Utilizador removido"
- empty rows produce the card's Portuguese empty state, which says data covers only the period since tracking began

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter=admin test`. Expected: FAIL.

- [ ] **Step 3: Implement the cards per `usage-home.html`**

Period default is last 30 days, using the kit's date range; dashboard filter sits above the cards. Line chart has direct labels and a legend (spec §4.1). Rows in "Utilizadores mais activos" link to `/users?user=<id>`, and Task B5's panel opens from that param.

- [ ] **Step 4: Verify**

Run: `pnpm --filter=admin test && pnpm --filter=admin exec tsc --noEmit && pnpm --filter=admin lint && pnpm turbo run build --filter=admin`. Then open the page against the dev API, with seeded events, at desktop and phone widths and in dark mode. Expected: numbers match the seeded data.

- [ ] **Step 5: Commit, then open the Part B PR into `main`**

`git commit -m "feat(admin): Utilização page"`

---

## Part C: Enforcement in the apps (`openldr-monorepo`)

**Do not merge until rollout step 5.**

### Task C1: Dashboard access in middleware

**Files:**
- Modify: `packages/design_system/src/lib/access.ts`, `lib/access.test.ts`, `apps/{tb,vl,eid}/middleware.ts`
- Create: `packages/design_system/src/app/organisms/report/no-access.tsx`, `apps/{tb,vl,eid}/app/sem-acesso/page.tsx`

**Interfaces:**
- Produces: `accessRedirect(id: DashboardId, pathname: string, access: UserAccess | null): "/sem-acesso" | null`. `apps/admin`'s `gateRedirect` is replaced by it. `NoAccess`: "Sem acesso a este dashboard", the switcher's accessible dashboards as links, and "Terminar sessão".

- [ ] **Step 1: Write the failing test for `accessRedirect`**

In `dashboards`: `null`. Not in `dashboards`: `/sem-acesso`. `null` access: `/sem-acesso`. On `/sem-acesso` itself: `null`. `admin` follows `access.admin`.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter=@repo/design_system test`. Expected: FAIL.

- [ ] **Step 3: Implement, and in each app's middleware, after `auth.protect()`, redirect per `accessRedirect(id, req.nextUrl.pathname, parseAccess(sessionClaims?.openldr))`**

- [ ] **Step 4: Verify**

Run the design-system tests, then `pnpm turbo run build --filter=tb --filter=vl --filter=eid --filter=admin`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(access): dashboards check access in middleware"`

### Task C2: Patient permission in the UI

**Files:**
- Modify: `packages/design_system/src/lib/report/facility.ts`, `lib/report/facility.test.ts`, `apps/tb/app/(dashboard)/layout.tsx`, `apps/tb/components/patients-data-dialog.tsx`
- Create: `apps/tb/lib/tb/admin.tsx`

**Interfaces:**
- Consumes: kit `AdminProvider`, `useAdminStatus`, `useIsAdmin`. The TB probe path is `/tb/gx/patients/by_facility/`, with `per_page=1`.

- [ ] **Step 1: Update the test for `NON_ADMIN_PATIENTS_HINT`**

Expected text: `"A lista de pacientes está disponível apenas para utilizadores com acesso a dados de pacientes."`

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter=@repo/design_system test`. Expected: FAIL.

- [ ] **Step 3: Implement**

- Change the hint, and search the VL, EID and kit text for other "Administradores" wording about patients.
- Wrap TB's layout in the provider. Hide "Pacientes" in TB's nav when `useIsAdmin()` is false.
- In `patients-data-dialog.tsx`, when the status is `user`, show the hint instead of an empty table. Every TB card using the dialog gets this without being changed.

- [ ] **Step 4: Verify in the browser with a dev-instance account without `patientData`, and an API with the flag on**

TB: click a facility and see the message. VL: filter by one facility and see its numbers. Run the tests, and `pnpm turbo run build --filter=tb --filter=vl --filter=eid`. Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat(access): clear patient-access messages; TB hides patients without the permission"`

### Task C3: Close self-registration

**Files:**
- Delete: `apps/{vl,tb,eid}/app/(auth)/sign-up/` where present
- Modify: `apps/{tb,vl,eid}/app/(auth)/sign-in/client.tsx`, `apps/{tb,vl,eid}/app/layout.tsx`, `apps/{tb,vl,eid}/middleware.ts`, `apps/tb/app/client.tsx`

- [ ] **Step 1: Remove the "Criar uma conta" links, the `signUpUrl` props, the `/sign-up` public routes and the sign-up pages**

Keep Google sign-in as it is, since restricted sign-up mode refuses unknown accounts at Clerk's side.

- [ ] **Step 2: Verify**

Run: `git grep -n "sign-up" apps/tb apps/vl apps/eid` (expected: no results), then `pnpm turbo run build --filter=tb --filter=vl --filter=eid`. Then `/sign-up` redirects to sign-in when signed out.

- [ ] **Step 3: Commit, then open the Part C PR into `main` and leave it unmerged**

`git commit -m "feat(access): remove self-registration"`

---

## Part D: Rollout (spec §7)

Each step needs the owner's go-ahead. Dev comes first throughout.

- [ ] **Step 1: Clerk setup (Owner).** On the dev instance and then production, add the session-token claim `"openldr": "{{user.public_metadata}}"`. Customise the invitation email in Portuguese if the plan allows.
- [ ] **Step 2: API (Owner merges).** Run `tools/sql/2026-11-05-usage-tables.sql` on the dev and production `users` databases. Run the SQL script, `tools/create_service_account.py` and a migration dry run on dev first, since none of them has run against a real system. Merge Part A to `dev`, test on `dev.openldr.org.mz`, release to `master`, deploy production manually. `PERMISSIONS_ENFORCED` stays unset. Create service accounts, add `API_SERVICE_ACCOUNTS` to Coolify, and move the parity tools over. The API query skill (`~/.claude/skills/openldr-query-api/scripts/query-api.sh`) and its source repo also need moving to a service account.
- [ ] **Step 3: Migrate.** Owner supplies the admins file. Migrate the dev instance first, then production. Run `tools/migrate_permissions.py` without `--apply`, review the summary (who gets admin, who gets patientData, and any users skipped for malformed metadata) with the owner, then `--apply`. Re-run to confirm zero changes. A wrong admins file is repaired with `--grant-admin EMAIL --apply`.
- [ ] **Step 4: Admin app.** DNS A record `admin` to the Coolify server (Owner). Create the Coolify app per the skill's `deploy-guide.md`, with `NEXT_PUBLIC_OPENLDR_API`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`; a dev deployment also sets `NEXT_PUBLIC_DASHBOARD_URL_ADMIN`, since invitations redirect to it. Check `CLERK_AUTHORIZED_PARTIES` on the API: if set, add the admin origin. Leave `NEXT_PUBLIC_PERMISSIONS_ENFORCED` unset. Merge Part B, which starts tracking on TB, VL and EID, and after deployment confirm one audit row is written. Verify the invitation ticket error codes on dev by reusing an invitation link. Set `ready: true` for `admin` in a follow-up commit. Owner reviews the list and reports.
- [ ] **Step 5: Enforce.**
  1. Review `/auth/login` caller logs from step 2 with the owner and confirm the status of the legacy `openldr-backend` and `openldr-api` with the owner; nothing unexpected may remain.
  2. Announce that VL facility numbers are widening and that sign-up is by invitation.
  3. Turn on restricted sign-ups in Clerk (Owner).
  4. Re-run the migration, dry run then `--apply`, to cover users who registered since step 3.
  5. Confirm a real production token carries the `openldr` claim.
  6. Merge Part C, and confirm the deployments.
  7. Add a rate limit on `/auth/login` at the proxy.
  8. Set `PERMISSIONS_ENFORCED=1` on the API, dev first, then production, and redeploy; set `NEXT_PUBLIC_PERMISSIONS_ENFORCED=1` on the admin app and rebuild. Update the "requires an Admin" Swagger text in the same API release if not done.
- [ ] **Step 6: Check with real accounts (spec §9).** For each kind (no dashboard, one dashboard, patient data on and off, blocked, admin), check the page and also a direct API call. Check that `/auth/login` refuses a personal account, and that a service token gets numbers and no patient rows.

**Rollback:** unset `PERMISSIONS_ENFORCED`, redeploy the API, and revert the Part C merge. Metadata stays in place. With the flag off, access reverts to the database roles, so anything revoked in the admin dashboard comes back. Turn restricted sign-ups back off only if the owner asks.
