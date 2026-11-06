# Admin Dashboard: Design

**Date:** 2026-11-05
**Status:** approved
**Mockups:** [`2026-11-05-admin-dashboard-mockups/`](2026-11-05-admin-dashboard-mockups/) (`usage-home.html`, `users-page.html`; open them in a browser, all data is invented)

Labels used below: **[Decision]** means the product owner decided it. **[Call]** means the author chose it and the owner can overrule it. Anything unlabelled follows from those.

## 1. Intent

Today nobody can answer "who uses the OpenLDR dashboards, and how often?", and access can't be managed per person: anyone with an account can open every dashboard, and patient data depends on a role in a SQL Server table.

The admin dashboard gives a small, high-privilege group one place to manage users and see usage. **[Decision]** Its users already use the other dashboards; ordinary users never see it.

### Goals

- **[Decision]** Create users, edit their details, grant dashboard access, allow or remove patient data access, and block users, all through the Clerk API.
- **[Decision]** Home page: usage reports. Second page: the user list.
- **[Decision]** Same design patterns and components as the other dashboards, primary colour `#00d0f0`.
- The permissions set here are actually enforced, in the apps and in the API. A setting that only hides a page does not count.

### Non-goals

- Deleting users. Blocking covers the need and can be undone. **[Call]**
- A screen for the admin action history. Actions are recorded (§5.4) but not displayed in this version. **[Call]**
- Per-dashboard patient permissions. One setting per user. **[Call]**
- Facility-level or province-level restriction of what a user sees.
- Cutting over `dpi.openldr.org.mz`. See §10.

### Anti-goals (a failure even if it works technically)

- A permission that looks removed in the admin dashboard while the data stays reachable through the API.
- Existing users locked out on launch day.
- Seeing patients giving someone the ability to manage users, or the reverse.
- Report-page failures caused by usage tracking.

## 2. What exists today

Checked on 2026-11-05 against `origin/main` (monorepo) and `origin/master` (API).

| Area | Today |
|---|---|
| Clerk | TB, VL and EID all serve a live key for one instance, `clerk.openldr.org.mz`, which the production API also trusts. The dev API (`dev.openldr.org.mz`) trusts a separate dev instance, `tough-tick-90.clerk.accounts.dev`. |
| App access | `middleware.ts` in each app only checks that the user is signed in. |
| Sign-up | `/sign-up` is public and the VL sign-in page links to it. |
| Role | `openldr_api_user_users.role` in the `users` database, read per request by Clerk user id. The value `"Admin"` is compared literally. |
| API entry | `utilities/controller_helpers.py`: `authenticate_request()` and `run_reporting_endpoint()`, which authenticates before serving the report cache. |
| API tokens | Two kinds: Clerk RS256, and HS256 from `/auth/login`, where the password is the Clerk user id (a known weakness). |
| Admin gate on VL | `facility_type=health_facility` returns single-facility **aggregates** and is Admin-only. `/hiv/vl/patients/*` is Admin-only. |
| Admin gate on TB | All 36 `facility_type=health_facility` Admin branches (20 facility, 16 laboratory) return **patient rows** through `get_patients`/`process_patients`. `/tb/gx/patients/*` is Admin-only. Per-facility **numbers** already come from `facility_type=district` with disaggregation, with no role check. |
| Admin gate on EID | `/hiv/eid/patients/*` is Admin-only. |
| App role check | The kit's admin probe calls a patient endpoint: 200/400 means admin, 401/403 means user. |
| Usage data | No analytics in the apps. The Clerk webhook writes login events to `openldr_api_user_logs` and `last_login`, with no dashboard or page. Whether production receives those webhooks was not confirmed. |

## 3. Permission model

**[Call]** Permissions live in Clerk `publicMetadata`, which only the server can write:

```json
{ "dashboards": ["vl", "tb", "eid"], "patientData": true, "admin": false }
```

| Setting | Controls | Notes |
|---|---|---|
| `dashboards` | Which dashboards the user can open | Checked in the app and the API |
| `patientData` | **[Decision]** Patient names and records only, including patient lists opened from a report | Global, not per dashboard |
| `admin` | Access to the admin dashboard | Independent of `patientData` |
| Block | Stops sign-in | Clerk ban, not metadata; revokes active sessions; reversible |

- A user with no metadata has no access. **[Call]** (fail closed)
- **[Decision]** Anyone with access to a dashboard sees its health-facility **numbers**. This widens access on VL.
- The rule for each endpoint is what it returns, not its parameters: aggregates need dashboard access only, patient rows also need `patientData`. So VL `health_facility` opens up. TB `health_facility` stays restricted, moving from the role to `patientData`, because it returns patient rows. TB users without `patientData` still see each facility's numbers through the district level, so no new TB endpoints are needed. Clicking a facility on TB, which opens its patient list, must show a clear message rather than an error.

**Reading permissions.** The Clerk session token gets a custom claim set in the Clerk dashboard (`"openldr": "{{user.public_metadata}}"`). The apps and the API read this claim, so no extra Clerk call happens per request. Session tokens live about 60 seconds, so a change or a block takes effect within about a minute. Writes in the admin dashboard always re-read the caller from the Clerk API rather than trusting the token.

## 4. Admin app

`apps/admin`, scaffolded from the VL skeleton per the `openldr-dashboard` skill's `scaffold-guide.md`, at `admin.openldr.org.mz` **[Call]**.

- Name "Administração". `#00d0f0` with foreground `#1C252E`, since white on this cyan fails contrast. **[Call]**
- All UI text in Portuguese, using `DashboardShell`, the card frame, `KpiCard` and `components/ui` (`sheet`, `input`, `table`).
- Add `admin` to `DashboardId` and the registry. The switcher and account drawer show it only to users with `admin`, and show each user only the dashboards they can open. **[Call]**
- `feat/home` (unmerged) has `COPY: Record<DashboardId, …>`, so its catalogue must exclude `admin` when it merges.
- Middleware requires `admin`. Anyone else who is signed in sees a "Sem acesso" page.
- Clerk secret-key calls run server-side only (server actions or route handlers). Each one checks the caller first.

### 4.1 Utilização (home page)

Layout per `usage-home.html`: filters for period (default last 30 days) and dashboard, then:

1. **KPIs:** active users, sessions, sessions per user, inactive users (no visit in over 90 days).
2. **Active users per month,** a line per dashboard over 12 months, with direct labels because VL green and TB red are indistinguishable to red-green colour-blind readers.
3. **Per dashboard:** active users, sessions, sessions per user. **[Decision]** This is the core question: who uses each dashboard and how often.
4. **Most active users:** name, dashboards, sessions, last visit. A row opens that user.
5. **Most viewed pages.** **[Call]** Added by the author, shown in the mockup without objection.
6. **Patient data access log:** who opened patient records and when. **[Call]** Same.

Reports only cover the period since tracking went live, and each card needs an empty state saying so. "Inactive" uses Clerk's `last_active_at` until tracking has 90 days of history.

### 4.2 Utilizadores (second page)

Layout per `users-page.html`:

- **List:** search by name or email; filters for status, dashboard and patient data. Columns: name and email, dashboards, patient access, status (Activo, Convite pendente, Bloqueado), last visit. The list merges Clerk users with pending invitations. Clerk can't filter on metadata server-side, so the app fetches all users and filters them; the user base is small enough. **[Call]**
- **Edit panel:** a side sheet with first name, last name, email; a switch per dashboard; switches for patient data and admin; Bloquear/Desbloquear.
- **Create:** **[Decision]** the same panel, empty, sends a Clerk email invitation; the user sets their own password. The chosen permissions travel in the invitation's `public_metadata`. A pending invitation can be resent or revoked. **[Call]**
- **Blocking** asks for confirmation. **[Call]**
- **Guard rails [Call]:** an admin can't block themselves or remove their own admin access, and the last admin can't lose admin access.

## 5. API changes (`api_openldr_python`)

Follows the repo's MVC pattern, with JWT auth and Swagger on every new endpoint. Per the skill's rule, API work ships first.

### 5.1 Permission checks

- Parse the `openldr` claim when verifying Clerk tokens.
- In `authenticate_request()`, map the path to a dashboard (`/hiv/vl` to `vl`, `/hiv/eid` to `eid`, `/tb` to `tb`) and return 403 without access. This runs before the report cache, so cached reports are covered. `/dict`, `/auth` and `/usage` are not dashboard-scoped.
- Replace `role == "Admin"` checks on patient data with `patientData`. Keep the existing 403 response shape, so the apps' admin probe keeps working and now reports patient access.
- An env flag `PERMISSIONS_ENFORCED`, off until migration is done. While off, behaviour is exactly as today. **[Call]**

### 5.2 Endpoint audit

List every use of the role across the services and classify each as aggregate or patient rows. Apply §3. The 36 TB branches are already known to be patient rows; the audit confirms the rest. The resulting table goes in the plan. Patient rows must never become reachable without `patientData`.

The VL and TB apps also hide facility-level views from non-admins in places; these must open for aggregates.

### 5.3 Usage tracking

- **`POST /usage/events`:** any signed-in user. Body: dashboard and page path. User id comes from the token, never the body.
- **Page views** are sent from `DashboardShell` on route change, fire-and-forget. A failure never reaches the user.
- **Sessions:** derived at read time, with a new session after 30 minutes of inactivity per user and dashboard. **[Call]**
- **Patient access log** is written server-side by the patient-returning endpoints, so it can't be skipped: user id, dashboard, endpoint, time, row count. **It never stores search terms, because they can be patient names.** **[Call]**
- **Storage:** new tables in the `users` database. No automatic deletion in this version. **[Call]**
- **Read endpoints** under `/usage/…` for each report in §4.1, requiring `admin`. Default period not cached in this version unless it proves slow. **[Call]**

### 5.4 Admin action history

**[Call]** Because these are high-privilege actions, each one is recorded through an admin-only API endpoint: who, what, target user, old and new values, time. No screen in this version.

### 5.5 Service accounts and `/auth/*`

**[Decision]** `/auth/login` is limited to named service accounts for tools. Personal accounts can no longer use it.

- **Allow-list [Call]:** account names in a Coolify variable on the API, `API_SERVICE_ACCOUNTS`. Each listed account is a row in `openldr_api_user_users` with its own long random secret, stored hashed in `password`.
- **At login:** refuse any `user_name` not on the list.
- **On each request:** an HS256 token whose subject isn't on the list gets a 401, so tokens already issued stop working when enforcement starts. Removing a name cuts that account off the same way.
- **Access [Decision]:** service accounts read report numbers on every dashboard and never reach patient rows. They can't call the `/usage` read endpoints or anything else that requires `admin`.
- **Retired [Decision]:** `/auth/users`, `/auth/create`, `/auth/update` and `/auth/delete`. `/auth/clerk` stays, since it receives Clerk's webhooks.
- **Tools:** `tools/vl_parity_check.py`, `tools/eid_parity_check.py` and the API query skill's notes move to service accounts.
- **Before enforcement:** find out who still uses `/auth/login`, including deployed services outside this check. If login records don't show this, log the caller for a period starting at rollout step 2.

All of this takes effect with `PERMISSIONS_ENFORCED`. While the flag is off, `/auth/*` works as it does today.

## 6. Enforcement in the apps

- TB, VL and EID middleware check the `dashboards` claim for that app and redirect to a shared "Sem acesso" page. Shared logic goes in a package, not three copies.
- `patientData` reaches the UI through the existing admin probe, so page gating needs little change.

## 7. Rollout

Order matters, so that nobody is locked out:

1. **Clerk setup (owner):** add the session-token claim; customise the invitation email in Portuguese, if the Clerk plan allows it (otherwise launch with the default email and raise it with the owner, **[Call]**); turn on restricted sign-ups (§8) at the agreed step.
2. **API** with `PERMISSIONS_ENFORCED` off, plus usage endpoints and `/auth/login` caller logging: dev, then production. Issue the service accounts and move the tools over.
3. **Migration script** (dry run first, printing a summary): **[Call]** every existing Clerk user gets all three dashboards; `patientData: true` for current `role == "Admin"` users; `admin: true` only for people the owner names.
4. **Admin app** deployed, owner reviews the list. Tracking starts when the shell change ships.
5. **Enforcement:** confirm nothing unexpected still uses `/auth/login`, deploy the app middleware, then turn `PERMISSIONS_ENFORCED` on. VL facility numbers widen at this point, so announce it. **[Decision to widen; timing is a Call]**

Rollback: turn the flag off and redeploy the previous apps. Metadata is additive, so it stays in place.

## 8. Self-registration

Invitations only make access meaningful if nobody can register themselves. With fail-closed defaults, a self-registered account would see nothing, but it's still confusing and adds noise to the user list. **[Call]** Set Clerk to restricted sign-ups and remove the `/sign-up` link from sign-in pages, keeping only what the invitation flow needs. The plan must verify that the custom auth pages handle Clerk's invitation ticket.

## 9. Testing

- Unit tests per the VL pattern: API endpoint classification and 403s, guard rails, list merging, session derivation.
- Clerk writes are tested on the dev instance with the dev API, which needs the same session-token claim and its own deployment of the admin app or a local run. Nothing is tried on real production users without the owner's go-ahead.
- Before step 5 of the rollout, check with real accounts of each kind: no dashboard, one dashboard, patient data on and off, blocked, and admin.
- A direct API call without permission must return 403 for each case, not just a hidden page.
- `/auth/login` refuses a personal account, an old personal token gets a 401, and a service-account token gets numbers but never patient rows.

## 10. Known limits

- `dpi.openldr.org.mz` still runs the legacy EID app with its legacy API, outside these permissions, until it's cut over.
- `openldr-backend` and `openldr-api` have patient routes with no authentication and sit outside these permissions. Confirm whether they're reachable, and shut them down or protect them, before calling enforcement complete.
- `ready: false` for EID in the registry affects the switcher only, but should be fixed before launch.

## 11. Left to the builder

Component breakdown, table schemas and endpoint names, how the shell receives the beacon, and pagination details. Plan and task order, provided the §7 sequence holds.
