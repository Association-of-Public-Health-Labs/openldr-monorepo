# Minimals-Style Sidebar and Restored Settings — Design

**Date:** 2026-10-15
**Status:** Draft for review
**Amends:** `2026-10-14-platform-foundation-shell-design.md` (§4.2 layout, §4.3 settings)
**Branch:** `feat/platform-shell`

## 1. Goal

Make the left sidebar of the platform shell look and behave like the
Minimals dashboard (https://minimals.cc/dashboard, the user's main design
reference), and bring back the old settings drawer with all its settings.

The governing rule of the platform spec still applies: only the shell
changes. Cards, card menus, filters, exports, nav items, routes and
behaviour stay exactly as they are.

### In scope

- Restore the old `SettingsDrawer` (unchanged) and all seven settings.
- Redesign the sidebar when it is fixed at the left (layouts `expanded`
  and `compact`), matching Minimals, including its round collapse/expand
  button.
- Keep the dashboard switcher exactly as it is now.

### Out of scope (later)

- Redesigning the settings drawer itself.
- Redesigning the top layout (`stacked`): it keeps today's old MUI layout,
  unchanged, with no switcher.
- Section titles in the nav (see §4.4).

## 2. What changes from the platform spec

| Platform spec | Now |
|---|---|
| §4.3: only mode and sidebar-collapsed survive; the drawer and its state are dropped | The old drawer and all seven settings come back and work |
| §4.2: user menu and a small "Modo" settings menu at the top right of the header | The header gets the old settings drawer button back (replacing the "Modo" menu); the user menu stays |
| §4.2: sidebar collapsed state in the shadcn `sidebar_state` cookie | Collapsed state is the `layout` setting (`expanded` / `compact`) |
| Sidebar look: shadcn defaults with today's dark colours | Minimals look, measured values in §4 |

## 3. Settings

### 3.1 The settings and what they do

The `SettingsProps` type and the `SettingsDrawer` component in
`design_system_mui` (re-exported by
`@repo/design_system/app/molecules/headers/SettingsDrawer`) are used
unchanged.

| Setting | Values | Effect (as before) |
|---|---|---|
| `mode` | `light` / `dark` | next-themes `setTheme`; MUI follows |
| `layout` | `expanded` / `compact` / `stacked` | expanded = full Minimals sidebar (300px); compact = Minimals mini sidebar (88px); stacked = today's old MUI top layout |
| `color` | `integrate` / `apparent` | integrate = light sidebar on the page background; apparent = dark sidebar (#141A21) |
| `contrast` | `positive` / `negative` | content background: positive = MUI `background.default`, negative = `background.paper` |
| `compact` | `large` / `small` | content side padding: large = 16px, small = 4px |
| `leftPanelWidth`, `rightPanelWidth` | numbers | passed to TB's `AIChatProvider`, as before |

Defaults, as before: `mode: "light"`, `contrast: "positive"`,
`layout: "compact"`, `compact: "large"`, `color: "apparent"`,
`rightPanelWidth: 25`, `leftPanelWidth: 75`.

The old small-screen rule comes back too: below 1280px wide, `compact` is
forced to `large`.

### 3.2 Where the state lives

A hook in the design system,
`packages/design_system/src/layout/useLayoutSettings.ts`, holds the
settings. It replaces the per-app zustand stores that were deleted.

- It reads and writes `localStorage["layout-settings"]` in the same format
  the zustand `persist` middleware used (`{"state":{"settings":{…}},"version":0}`),
  so every user keeps their saved choices.
- It does not use zustand: the package does not depend on it, and adding it
  would change the lockfile.
- Malformed or partial stored data falls back to the defaults, field by
  field.
- It is one shared store (module-level state read with
  `useSyncExternalStore`), so the shell and TB's layout (which needs the
  panel widths) see the same settings.
- Changing `mode` also calls next-themes `setTheme`, as the old layouts did.

### 3.3 Keeping the drawer and the round button in sync

The round button changes `layout` between `expanded` and `compact`. The old
drawer copies `settings.layout` into its own local state when it mounts, so
it would show a stale selection after a button click. The shell remounts
the drawer when `settings.layout` changes (a React `key`), which fixes this
without editing the drawer.

## 4. The sidebar (layouts `expanded` and `compact`)

All values were measured on minimals.cc on 2026-10-15.

### 4.1 Container

| | Expanded | Compact (mini) |
|---|---|---|
| Width | 300px | 88px |
| Background, `integrate` | page background (`--background`) | same |
| Right border, `integrate` | 1px rgba(145,158,171,0.12) | same |
| Background, `apparent` | #141A21 | same |
| Right border, `apparent` | none | same |
| Nav list padding | 0 16px; items 4px apart | 0 4px; items 4px apart |
| Top area | dashboard switcher, unchanged, 20px from the top | emblem only, centred |

### 4.2 Nav items

| | Expanded | Compact (mini) |
|---|---|---|
| Size | 44px min height, full width | 79px wide, 56px min height |
| Shape | radius 8px | radius 8px |
| Padding | 4px 8px 4px 12px | 8px 4px 6px |
| Layout | icon then label in a row | icon above label, centred |
| Icon | 24px box, 12px gap to the label | 22px box, 6px gap below |
| Label | 14px, weight 500 (inactive) / 600 (active), line height 22px | 10px, weight 700, line height 16px |
| Inactive colour, `integrate` | #637381 | same |
| Inactive colour, `apparent` | #919EAB | same |
| Hover background | rgba(145,158,171,0.08) | same |
| Active colour, `integrate` | dashboard primary | same |
| Active colour, `apparent` | lighter tint of the primary | same |
| Active background | primary at 8% opacity | same |

In compact mode labels that do not fit are truncated with an ellipsis;
the full label shows in a tooltip, as now.

### 4.3 Collapse/expand button

- 26×26px circle, white background, 1px border rgba(145,158,171,0.12),
  padding 4px, grey #637381 chevron 16px.
- Centred on the sidebar's right edge (its centre sits on the border line),
  36px from the top of the page to its centre, above the sidebar and the
  header (z-index higher than both, below popups).
- Chevron points left when expanded, right when compact.
- White in both `integrate` and `apparent` colours, as on Minimals.
- Hidden below the `md` breakpoint (the mobile slide-in panel is used).
- It has an accessible name ("Recolher menu" / "Expandir menu").

### 4.4 What stays different from Minimals, on purpose

- Font: Open Sans (brand), not Public Sans.
- No section titles ("OVERVIEW" etc.): our dashboards have 3–4 items and no
  groups, and the nav items must not change.
- No nav groups, badges or sub-items: none exist in our nav.

### 4.5 Unchanged

- Dashboard switcher (trigger and menu).
- Header: `{portalTitle} - {pageTitle}`, user menu; the "Modo" menu is
  replaced by the old settings drawer button.
- Mobile (below `md`): sidebar as a slide-in panel opened from the header.
- Right panel slot.

## 5. Layout `stacked`

When `layout` is `stacked`, the shell renders today's old MUI
`DashboardLayout` from `design_system_mui`, unchanged, with the same props
the apps passed before (`options`, `pagename`, `portalTitle`, `user`,
`settings`, `handleSetAppSettings`, `aiChatIsOpen={false}`). It shows no
dashboard switcher. The settings drawer inside it lets the user switch back
to a left layout.

## 6. Components and files

| File | Change |
|---|---|
| `packages/design_system/src/layout/useLayoutSettings.ts` (+ test) | new: settings state, storage, defaults, small-screen rule |
| `packages/design_system/src/layout/sidebar-styles.ts` (+ test) | new: pure functions returning the class names / colours for a given `color` setting, active state and mode |
| `packages/design_system/src/layout/ShellSidebar.tsx` | new: Minimals-style sidebar (expanded / compact) with the switcher on top |
| `packages/design_system/src/layout/CollapseButton.tsx` | new: the round button |
| `packages/design_system/src/layout/ShellHeader.tsx` | settings menu → old `SettingsDrawer` |
| `packages/design_system/src/layout/DashboardShell.tsx` | owns the settings; picks the left layout or the old stacked layout; applies contrast and padding |
| `apps/tb/app/(dashboard)/layout.tsx` | reads the panel widths with `useLayoutSettings` and passes them to `AIChatProvider`, as before |

`DashboardShell` keeps its props, so VL's layout does not change. For the
stacked layout the shell passes the nav items to the old layout as its
`options`; `ShellNavItem` (`label`, `href`, `icon`, `active`) already
matches the old `OptionsProps` shape.

## 7. Testing

- **Unit:** `useLayoutSettings`: defaults, reading the old zustand format,
  bad data falls back field by field, writes back in the same format, the
  small-screen rule. `sidebar-styles`: active and inactive colours for
  `integrate` and `apparent`, light and dark.
- **Render (static):** the shell renders the Minimals sidebar for
  `expanded` and `compact` (width, item classes, button label and chevron
  direction); renders the old layout for `stacked`; the switcher is present
  in both left layouts; the header contains the settings drawer button.
- **Existing checks keep passing:** design system tests, VL's 124 tests,
  `tsc`, lint and `next build` for both apps.
- **Visual:** side-by-side screenshots against minimals.cc for the sidebar
  (expanded, compact, hover, active, `apparent`), and before/after
  screenshots of every TB and VL page to confirm nothing inside the cards
  changed.

## 8. Success criteria

1. The settings drawer is back, unchanged, and all seven settings work,
   with users' saved choices kept.
2. In `expanded` and `compact`, the sidebar matches the measured Minimals
   values in §4, including the round button.
3. `stacked` shows today's old top layout, unchanged.
4. The switcher, header text, user menu, mobile panel and all cards are
   unchanged.
5. All automated checks pass.
