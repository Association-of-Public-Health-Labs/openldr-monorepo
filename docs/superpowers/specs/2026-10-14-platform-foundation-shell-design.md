# OpenLDR Platform Foundation and Shell — Design

**Date:** 2026-10-14
**Status:** Draft for review
**Sub-project:** 1 of 3 of the OpenLDR platform redesign

> ## ⚠️ Governing rule: improve the design, never the structure
>
> **This redesign must not change the structure of the existing components.**
> Its only purpose is to make the look consistent across dashboards. This
> rule applies to all three sub-projects and overrides any other part of
> this spec.
>
> **Frozen (must stay exactly as today):**
> - component props and public APIs (e.g. `MainCard`, `Stacked`, dialogs,
>   tables), and how pages compose cards;
> - card layout and contents: titles, subtitles, menus and their options,
>   tabs, filters, charts, tables, the order and number of cards per page;
> - behaviour: drill-downs, dialogs, exports (Excel columns, PNG), filters,
>   permissions (e.g. VL Admin-only views), loading and error states;
> - data flow: API calls, params, transforms, report logic;
> - routes, page names and navigation items.
>
> **Allowed to change (visual only):** colours, fonts, spacing, radius,
> shadows, borders, icon styling, and the implementation behind a component
> (MUI → Tailwind) as long as its props, structure and behaviour stay the
> same.
>
> **The only structural additions**, approved by the user: the dashboard
> switcher at the top of the sidebar, and the removal of unused settings
> (§4.3). The sidebar, header and content regions stay where they are today.
> Because of these two, the page layout component is the one exception to
> frozen props: `DashboardShell` (§4.2) replaces `DashboardLayout` and drops
> the settings props. It is used once per app, in the dashboard layout file.
>
> **How it is enforced:** existing tests must pass unchanged (a test edited
> to make it pass is a structure change and needs approval); before/after
> screenshots must show only visual differences (§6); any change that would
> touch the frozen list stops the work and goes to the user first.

## 1. Context and goals

OpenLDR is becoming one platform with one Next.js app per test dashboard in
`apps/` (today `apps/tb` and `apps/vl`; EID and others later). The apps must
share one structure, one navigation and one design system, while each
dashboard keeps its own primary colour.

The redesign is split into three sub-projects, each with its own spec, plan
and implementation:

1. **Foundation and platform shell** (this spec): shared tokens and theming,
   the new sidebar shell with a dashboard switcher, and a clean package
   boundary.
2. **MUI → Tailwind/shadcn migration**, in waves:
   (a) card shell, status card, skeletons;
   (b) popups and dialogs, including a Tailwind date-range picker replacing
   `@mui/x-date-pickers`;
   (c) chart wrappers and palette;
   (d) tables;
   (e) maps and atoms;
   (f) remaining app MUI imports, then delete `packages/design_system_mui` and
   the MUI dependencies.
3. **Apply the Open Design redesign** (designed in Open Design from
   `design-system-screenshots/`).

### Goals of this sub-project

- One source of design tokens, consumed by Tailwind/shadcn and by MUI.
- One primary colour per dashboard: VL `#00B000`, TB `#F8A200` (placeholder).
- A shared Tailwind `DashboardShell` with a dashboard switcher at the top of
  the sidebar.
- Apps import shared visual code only from `@repo/design_system`.
- Production TB and VL are not affected until an explicit merge decision.

### Non-goals

- Changing the structure of any existing component (see the governing rule
  above): card contents, charts, tables, reports, per-report logic.
- Removing MUI (sub-project 2).
- The visual redesign itself (sub-project 3).
- Moving Clerk to a production instance (separate prerequisite, see §7).

### Ownership rule

Shared or visual code lives in `@repo/design_system`. Test-specific logic
(endpoints, query params, VL lab groups, drill-down rules) stays in the apps.
Shared non-visual logic goes to a non-visual package such as
`@repo/utilities`.

## 2. Current state (what this replaces)

- Apps import deep source paths `@repo/design_system/*` →
  `packages/design_system/src/*` via tsconfig `paths`; there is no
  `transpilePackages`. 86 of 97 `src/app` files in the package are one-line
  re-exports of `@repo/design_system_mui`.
- MUI themes are copied four times: `packages/design_system/src/themes`,
  `packages/design_system_mui/src/themes`, `apps/tb/themes`, `apps/vl/themes`
  (`light.ts`, `dark.ts`, `charts.ts`, `map.light.ts`, `map.dark.ts`).
  Palette: primary `#00B000`, secondary `#F8A200`, error `#EF5350`, info
  `#6B52DC`; Open Sans; 16px card radius.
- `apps/tb/app/globals.css` and `apps/vl/app/globals.css` are identical
  (stock shadcn neutral OKLCH tokens, ApexCharts/tippy `!important` overrides,
  `--font-sans` pointing at an undefined `--font-geist-sans`). The brand
  green is not in the CSS tokens.
- 16 byte-identical shadcn files in `apps/tb/components/ui` and
  `apps/vl/components/ui`. The package has its own `components/ui` with 30
  files, including `sidebar.tsx`, but not `resizable.tsx`.
- Dark mode is wired twice: next-themes (`apps/*/context/theme-provider.tsx`)
  and `ThemeModeProvider` from `design_system_mui`. `SettingsDrawer` toggles
  both.
- `DashboardLayout` (MUI, 301 lines) takes `options`, `settings`,
  `handleSetAppSettings`, `user`, `pagename`, `aiChatIsOpen`, `portalTitle`.
  `SettingsDrawer` (590 lines) manages mode, contrast, layout, compact,
  colour, right and left panel widths.
- The chart palette `themes/charts.ts` (`theme1`) has a malformed `"8B0000"`
  in the app copies (`apps/*/themes/charts.ts`, not imported anywhere). The
  live chart palette is `packages/design_system_mui/src/themes/charts.ts`.
  VL series colours live in `apps/vl/lib/vl/series.ts`.
- Package shadcn files import with the `@/` alias (`@/lib/utils`,
  `@/components/ui/...`). Inside a Next app `@/` means the app root, so these
  files only work while the app has its own copies.
- TB wraps its layout in `AIChatProvider` (`@repo/ai`); a TB card menu option
  (`mtb-xpert-ultra-facilities`) calls `openChat`, and `useAIChat` throws
  outside the provider.

## 3. Tokens and theming

### 3.1 Shared stylesheet

`packages/design_system/src/styles/theme.css` defines the semantic CSS
variables for `:root` (light) and `.dark`:

`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`,
`--popover-foreground`, `--muted`, `--muted-foreground`, `--border`,
`--input`, `--ring`, `--primary`, `--primary-foreground`, `--secondary`,
`--secondary-foreground`, `--accent`, `--accent-foreground`,
`--destructive`, `--warning`, `--success`, `--info`, `--radius`,
`--chart-1` … `--chart-8`, and the `--sidebar-*` set used by shadcn
`sidebar`.

It also holds the `@theme inline` mapping for Tailwind 4 and the existing
ApexCharts/tippy overrides (moved verbatim).

Initial values: the current shadcn neutral tokens, plus `--destructive`
`#EF5350`, `--info` `#6B52DC`, `--radius` 16px for cards. Sub-project 3
replaces the values; the names stay.

Each app's `globals.css` shrinks to the Tailwind and `tw-animate-css`
imports, its existing `@source` lines, and one relative import of the shared
file (relative, like the existing `@source` lines, so no package `exports`
change is needed):

```css
@import "tailwindcss";
@import "tw-animate-css";
@source ...;   /* the existing @source lines, unchanged */
@import "../../../packages/design_system/src/styles/theme.css";
```

plus any rules that are truly app-specific (none are expected today).

### 3.2 Per-dashboard primary colour

Each app sets `data-dashboard="<id>"` on `<html>`. `theme.css` contains:

```css
[data-dashboard="vl"] { --primary: #00B000; --primary-foreground: #FFFFFF; }
[data-dashboard="tb"] { --primary: #F8A200; --primary-foreground: #1A1A1A; }
```

The same values apply in light and dark mode. Known issue: white text on
`#00B000` is about 2.9:1, below WCAG AA for normal text. It matches today's
VL look and is kept here; sub-project 3 sets final colours and contrast.
`--ring` and `--sidebar-primary` derive from `--primary`. `--chart-1` …
`--chart-5` keep their current values: TB report docs show them as the
legend of existing charts.
The values come from the dashboard registry (§4.1); a unit test checks that
the CSS and the registry agree.

### 3.3 MUI bridge

`packages/design_system/src/theme/createMuiTheme.ts` exports
`createMuiTheme(dashboard: DashboardId, mode: "light" | "dark"): Theme`. It
reproduces today's app theme (`apps/*/themes/light.ts` and `dark.ts`, which
are identical in TB and VL) value for value, except `palette.primary.main`,
which comes from the registry. MUI components therefore follow the dashboard
colour until sub-project 2 removes them. `success` (`#00B000`) and `warning`
(`#F8A200`) are status colours and do not change per dashboard.

Deleted: `apps/{tb,vl}/themes/*` (the malformed `"8B0000"` goes with them)
and `packages/design_system/src/themes/{light,dark}.ts` (Storybook switches
to `createMuiTheme`). `packages/design_system_mui/src/themes/*` stays until
wave 2f, because the MUI charts and maps import it. The one app import of a
theme file (TB `mtb-piechart-card/constants.ts`, a relative path into
`design_system_mui`) moves to `@repo/design_system/themes/charts`, an
identical copy.

### 3.4 One dark-mode system

`PlatformThemeProvider` (in the package) wraps next-themes
(`attribute="class"`) and feeds the resolved mode into
`createMuiTheme`. next-themes owns the `.dark` class; MUI only follows it.
`AppProvider`, `ThemeModeProvider` and `apps/*/context/theme-provider.tsx`
stop being used by the apps.

Known limit: the mode is stored per origin, so it does not carry across
subdomains. Accepted for now.

### 3.5 Fonts

The `next/font` Open Sans call stays in each app's root layout, as today
(`variable: "--font-open-sans"`): `next/font` needs literal options in a file
Next compiles, and the package does not depend on `next`. `theme.css` sets
`--font-sans: var(--font-open-sans), "Open Sans", system-ui, sans-serif`,
replacing the undefined Geist variables. No `fonts.ts` file.

### 3.6 Chart colours

`packages/design_system/src/charts/chartColors.ts` exports
`chartColors(dashboard: DashboardId): string[]`, returning 8 colours whose
first entry is the dashboard primary, followed by the shared palette.
It is added and tested now but not wired into any chart: chart wrappers
are wave 2c. VL keeps its legacy series colours in `apps/vl/lib/vl/series.ts`
(rulings P11–P13 of the VL migration) until sub-project 3.

## 4. Platform shell

### 4.1 Dashboard registry

`packages/design_system/src/dashboards.ts`:

```ts
export type DashboardId = "vl" | "tb";

export interface DashboardInfo {
  id: DashboardId;
  name: string;         // switcher label
  portalTitle: string;  // header / document title
  url: string;          // absolute URL of the app
  primary: string;      // hex
}

export const DASHBOARDS: DashboardInfo[] = [
  { id: "vl", name: "Carga Viral", portalTitle: "Portal de Carga Viral",
    url: "https://vl.openldr.org.mz", primary: "#00B000" },
  { id: "tb", name: "Tuberculose", portalTitle: "Portal de Testagem Laboratorial de TB",
    url: "https://tb.openldr.org.mz", primary: "#F8A200" },
];

export function getDashboards(): DashboardInfo[];   // with URL overrides applied
export function getDashboard(id: DashboardId): DashboardInfo;
```

URL override: `NEXT_PUBLIC_DASHBOARD_URL_VL` and `NEXT_PUBLIC_DASHBOARD_URL_TB`
replace the default URLs when set (e.g. `http://localhost:3001` locally, or a
staging domain). Each variable is read with a literal
`process.env.NEXT_PUBLIC_…` expression so Next.js inlines it at build time.

Adding a dashboard means: one registry entry, one `[data-dashboard]` line in
`theme.css`, one env variable name.

### 4.2 `DashboardShell`

`packages/design_system/src/layout/DashboardShell.tsx`, built with Tailwind
on the package's shadcn `sidebar` primitives.

```ts
interface ShellNavItem { label: string; href: string; icon?: React.ReactNode; active: boolean; }

interface DashboardShellProps {
  dashboard: DashboardId;
  nav: ShellNavItem[];                  // built by the app as today (VL Admin-only items, active flag)
  user: { name: string; email: string; imageUrl?: string };
  onSignOut: () => void;
  pageTitle?: string;
  rightPanel?: React.ReactNode;         // optional; not rendered when undefined
  children: React.ReactNode;
}
```

Layout:

The regions stay where they are today (governing rule): sidebar on the
left, sticky header on top of the content, user menu and settings at the
top right of the header.

- **Top of sidebar — dashboard switcher**, in the place of today's emblem.
  The trigger shows the emblem, a colour mark in the dashboard primary and
  the dashboard name with a chevron. The dropdown lists every registry entry
  with its colour dot; the current one has a check and is not a link.
  Choosing another opens its URL in the same tab. When the sidebar is
  collapsed only the emblem and colour mark show, with a tooltip.
- **Below — app navigation** from `nav`, same items, icons and order as
  today. The item with `active: true` (computed by the app, as today) uses
  `--primary`.
- **Sidebar state** — collapsed (icons only) by default, as today's
  `compact` layout; a toggle expands it.
- **Header** — the same text as today, `{portalTitle} - {pageTitle}`; at the
  right, the settings menu (light / dark / system) and the user menu with
  today's items (name, email, "Conta de Perfil", "Configurações",
  "Sair da conta"). Below the `md` breakpoint the sidebar is a slide-in sheet
  opened from a header button.
- **Right panel** — optional slot beside the content, reserved for the
  future AI chat; not rendered when `rightPanel` is undefined, and no app
  passes it now. TB keeps its `AIChatProvider` wrapper exactly as today,
  because a TB card menu option opens the chat and the hook throws without
  the provider; removing that option would be a structure change (governing
  rule) and needs the user's approval.

Auth stays in the apps: each app gets the user and sign-out from Clerk and
passes them in. The shell has no Clerk dependency.

### 4.3 Settings

Only two settings survive: **mode** (owned by next-themes) and **sidebar
collapsed** (shadcn sidebar's own cookie). Contrast, layout, compact, colour
and panel widths are dropped, not ported. `SettingsDrawer` and the app
settings state (`handleSetAppSettings`) stop being used.

### 4.4 Errors and edge cases

- Unknown or missing `dashboard` id is a type error; at runtime
  `getDashboard` throws, failing the build/render loudly.
- A malformed `NEXT_PUBLIC_DASHBOARD_URL_*` (not an absolute http(s) URL) is
  ignored and the default URL used, with a console warning.
- An empty `nav` renders the shell without a menu.
- A user without an image shows initials.

## 5. Package boundary

### 5.1 New in `@repo/design_system`

- `styles/theme.css`, `dashboards.ts`, `charts/chartColors.ts`
- `theme/createMuiTheme.ts`, `theme/PlatformThemeProvider.tsx`
- `layout/DashboardShell.tsx` and its parts (switcher, header menus)
- the package's `components/ui/*` switch from `@/` imports to relative
  imports, so they work when compiled inside an app; for the 10 files where
  the app copy differs (`card`, `chart`, `dialog`, `scroll-area`,
  `separator`, `skeleton`, `tabs`, `toggle-group`, `toggle`), the live app
  version replaces the package version, so the apps render as today.

The apps' `resizable.tsx` is not imported anywhere (`@repo/ai` has its own
copy), so it is deleted, not moved. No new dependencies.

### 5.2 Removed from the apps

- `apps/{tb,vl}/components/ui/*` — imports point at
  `@repo/design_system/components/ui/*`. Where the app copy differs from the
  package copy, the difference is reconciled in the package and noted in the
  plan.
- `apps/{tb,vl}/themes/*` — imports point at the package.
- `apps/{tb,vl}/context/theme-provider.tsx` and
  `apps/{tb,vl}/hooks/useLayoutSettings.ts` (the settings store).
- The duplicated content of `apps/{tb,vl}/app/globals.css`.

`CLAUDE.md` (Quick Reference and templates, which still show
`@/components/ui/tabs`) is updated to the package import paths.

### 5.3 Unchanged for now

- The MUI `DashboardLayout` and `SettingsDrawer` stay in
  `design_system_mui`, unused, until wave 2f deletes that package.
- `MainCard`, cards, charts, tables, maps and all report code.

### 5.4 Import rule

ESLint `no-restricted-imports` in both apps:

- **error** — `@repo/design_system_mui` and its subpaths;
- **warning** — `@mui/*` (18 app files today; fixed in wave 2f, when the
  rule becomes an error).

## 6. Testing and verification

- **Unit tests** (in the package):
  - registry: defaults, env URL override, malformed override ignored,
    `getDashboard` throws on unknown id;
  - `theme.css` `[data-dashboard]` primaries match the registry;
  - `chartColors` starts with the dashboard primary and returns 8 colours;
  - `createMuiTheme` equals today's app theme except the primary, per
    dashboard and mode;
  - switcher marks the current dashboard and links to the others with the
    registry URLs.
- **Storybook:** shell (expanded, collapsed, mobile, with and without right
  panel), switcher, and a token page for VL and TB in light and dark.
- **Existing checks keep passing:** VL's 124 tests, `tsc`, lint, and
  `next build` for both apps.
- **Before/after screenshots** of every TB and VL page, light and dark.
  Allowed differences: the new sidebar and header; the shadcn `--primary`
  token, which today is near-black, becomes the dashboard colour (shadcn
  buttons, focus rings, the Clerk sign-in button); and TB's MUI primary
  (green → `#F8A200`). Any other change inside a card is a regression.
- Lockfile: dependencies change only with `pnpm install --frozen-lockfile`
  after an intentional, reviewed lockfile edit (ruling R-d: a plain
  `pnpm install` re-resolves `csstype` and breaks TB's type-check).

## 7. Isolation and rollout

- Work happens in a git worktree on a long-lived branch
  `feat/platform-shell`, created from `main` **after PR #15 (VL dashboard)
  merges**, so VL is included. The original working folder is not touched.
- `main` is merged into the branch regularly so it does not drift.
- Production TB and VL deploy only from `main`, so nothing reaches users
  before the merge.
- Optional staging: two Coolify apps building from the branch (e.g.
  `staging-vl.openldr.org.mz`, `staging-tb.openldr.org.mz`) against the
  production API, using the `NEXT_PUBLIC_DASHBOARD_URL_*` overrides so the
  switcher stays within staging. Creating them needs the user's approval.
- Merging to `main` is an explicit user decision, after the screenshot
  comparison and the staging review.
- **Prerequisite outside this spec:** staying signed in when switching
  dashboards needs the Clerk production instance on `openldr.org.mz`. Until
  then each app asks the user to sign in once; the switcher works either way.

## 8. Success criteria

1. TB and VL render with the shared shell, the switcher at the top of the
   sidebar, and their own primary colour, in light and dark mode.
2. Switching dashboards from either app opens the other app's URL.
3. Neither app contains `components/ui`, `themes` or `theme-provider.tsx`
   copies, and neither imports `@repo/design_system_mui`.
4. All tests, type-checks, lint and builds pass; screenshots show only the
   allowed differences.
5. No production change until the user merges `feat/platform-shell`.
6. No frozen item from the governing rule has changed: same props, same
   cards and their order, same menus, filters, exports and behaviour on
   every page of TB and VL.
