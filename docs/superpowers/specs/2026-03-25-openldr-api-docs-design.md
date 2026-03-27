# OpenLDR Analytics API Documentation — Design Spec

**Date:** 2026-03-25
**Status:** Draft
**App:** `apps/api-documentation` (openldr-api-docs)
**Template:** Tailwind Plus Protocol (Next.js 16, React 19, Tailwind CSS 4, MDX)

---

## 1. Goal

Build a bilingual (English/Portuguese) API documentation site for the OpenLDR Analytics API (`api_openldr_python`). The site documents all endpoints across HIV (Viral Load, EID, Advanced Disease) and TB (GeneXpert, Cultura) modules, with an introduction to the OpenLDR platform.

---

## 2. URL Structure & Routing

All pages are nested under a `[locale]` dynamic segment (`en` or `pt`).

```
src/app/[locale]/
├── layout.tsx                          → Locale-aware layout
├── page.mdx                            → Introduction
├── quickstart/page.mdx                 → Quickstart guide
├── openldr-data/page.mdx               → OpenLDR platform docs
├── hiv/
│   ├── viral-load/page.mdx             → HIV VL endpoints (35)
│   ├── eid/page.mdx                    → HIV EID endpoints (35)
│   └── advanced-disease/page.mdx       → Placeholder (CD4, TB-LAM, CrAg)
└── tb/
    ├── genexpert/page.mdx              → TB GeneXpert endpoints (46)
    └── cultura/page.mdx                → Placeholder
```

Each locale folder contains its own MDX files — English content in `en/`, Portuguese in `pt/`. Content is maintained independently per language.

**Root redirect:** `src/app/page.tsx` redirects `/` to `/en/`.

**File duplication:** Every MDX page exists twice (once per locale). This is intentional — documentation is long-form prose that doesn't benefit from key-based i18n.

---

## 3. Locale Infrastructure

### 3.1 Locale Detection

A `getLocaleFromPathname(pathname: string): 'en' | 'pt'` utility extracts the locale from the current URL path.

### 3.2 Navigation Config

A `getNavigation(locale: 'en' | 'pt')` function returns the sidebar navigation array with translated titles and locale-prefixed hrefs.

**English:**
```typescript
[
  {
    title: 'Guide',
    links: [
      { title: 'Introduction', href: '/en/' },
      { title: 'Quickstart', href: '/en/quickstart' },
      { title: 'OpenLDR Data', href: '/en/openldr-data' },
    ],
  },
  {
    title: 'Tests',
    links: [
      { title: 'HIV Viral Load', href: '/en/hiv/viral-load' },
      { title: 'HIV Early Infant Diagnosis', href: '/en/hiv/eid' },
      { title: 'HIV Advanced Disease', href: '/en/hiv/advanced-disease' },
      { title: 'TB GeneXpert', href: '/en/tb/genexpert' },
      { title: 'TB Cultura', href: '/en/tb/cultura' },
    ],
  },
]
```

**Portuguese:**
```typescript
[
  {
    title: 'Guia',
    links: [
      { title: 'Introdução', href: '/pt/' },
      { title: 'Início Rápido', href: '/pt/quickstart' },
      { title: 'Dados OpenLDR', href: '/pt/openldr-data' },
    ],
  },
  {
    title: 'Testes',
    links: [
      { title: 'HIV Carga Viral', href: '/pt/hiv/viral-load' },
      { title: 'HIV Diagnóstico Infantil Precoce', href: '/pt/hiv/eid' },
      { title: 'HIV Doença Avançada', href: '/pt/hiv/advanced-disease' },
      { title: 'TB GeneXpert', href: '/pt/tb/genexpert' },
      { title: 'TB Cultura', href: '/pt/tb/cultura' },
    ],
  },
]
```

### 3.3 Language Toggle Component

A `LanguageToggle` component in the Header, placed next to `ThemeToggle`.

**Behavior:**
- Displays two buttons: `EN` and `PT`
- Active locale is visually highlighted
- Clicking switches the locale segment in the current URL path (e.g., `/en/hiv/viral-load` → `/pt/hiv/viral-load`)
- Uses Next.js `useRouter` + `usePathname` for navigation

**Visual style:** Matches the ThemeToggle button size and styling. Two small text buttons side-by-side.

**URL slug invariant:** URL slugs are identical across locales (e.g., `/en/quickstart` and `/pt/quickstart`, NOT `/pt/inicio-rapido`). Only the MDX page content and navigation titles are translated — never the URL paths. This simplifies the language toggle (swap first path segment) and avoids slug mapping tables.

---

## 4. Page Content Design

### 4.1 Introduction Page (`/[locale]/`)

Three sections:

1. **Hero** — Title "OpenLDR Analytics API", brief description of the API purpose, base URL (`https://api.openldr.org.mz`), authentication method (JWT Bearer token).

2. **Guides** — Reuses the existing `Guides` component pattern. Cards linking to:
   - Quickstart
   - OpenLDR Data

3. **Tests** — Replaces the template's "Resources" section. A grid of interactive cards (reusing the `Resources` component with `GridPattern` hover effects). Each card has an icon, name, description, and link:

| Card | Description (EN) | Link |
|------|------------------|------|
| HIV Viral Load | Viral load suppression monitoring and reporting | `/[locale]/hiv/viral-load` |
| HIV Early Infant Diagnosis | PCR-based early diagnosis for HIV-exposed infants | `/[locale]/hiv/eid` |
| HIV Advanced Disease | CD4, CrAg, and TB-LAM testing (coming soon) | `/[locale]/hiv/advanced-disease` |
| TB GeneXpert | GeneXpert MTB/RIF Ultra and XDR testing | `/[locale]/tb/genexpert` |
| TB Cultura | TB culture and sensitivity testing (coming soon) | `/[locale]/tb/cultura` |

### 4.2 Quickstart Page (`/[locale]/quickstart`)

Covers:
- Authentication — How to obtain a JWT token via `POST /auth/login`
- Making your first request — Example API call with curl/Python/JS
- Common parameters — `interval_dates`, `province`, `district`, `facility_type`, `disaggregation`
- Response format — JSON array/object patterns
- Error handling — 401, 500 response codes

### 4.3 OpenLDR Data Page (`/[locale]/openldr-data`)

A single comprehensive page documenting the OpenLDR platform (sourced from https://sites.google.com/site/openldr/):

- **What is OpenLDR** — Centralized national lab data repository. "Good Infrastructure = Better Data = Increase Demand for Data = Better Patient Outcomes."
- **Design Principles** — Simplicity (3 core tables, HL7 naming), report-oriented design, anonymous patient data, international standards (SI units, HL7 v2.5, LOINC, ICD-10), multi-level applicability
- **Data Model** — Two databases: OpenLDRData (Requests, LabResults, Monitoring, VersionControl) and OpenLDRDict (lookup/dictionary tables). Minimalist de-normalized design for usability.
- **Data Flow** — XML import from LIS/instruments → MirthConnect → OpenLDR database. HL7 mapping for standardized data exchange.
- **Multi-Country Model** — Each country maintains sovereign data control while sharing technology, visualization tools, and reporting templates.

### 4.4 Endpoint Documentation Pages

Each test page follows the same structure. Example for HIV Viral Load:

```markdown
# HIV Viral Load

{Lead paragraph: what VL testing is and what this API provides}

## Common Parameters {{ tag: 'ALL', label: 'Query Parameters' }}

<Row>
  <Col>
    <Properties>
      <Property name="interval_dates" type="JSON array">
        Date range filter. Format: ["YYYY-MM-DD", "YYYY-MM-DD"]
      </Property>
      <Property name="province" type="string">
        Province name filter (multi-select)
      </Property>
      <Property name="district" type="string">
        District name filter (multi-select)
      </Property>
      <Property name="health_facility" type="string">
        Specific facility name
      </Property>
      <Property name="facility_type" type="string">
        Grouping level: "province", "district", or "health_facility"
      </Property>
      <Property name="disaggregation" type="string">
        Enable data breakdown: "True" or "False"
      </Property>
    </Properties>
  </Col>
  <Col sticky>
    Example parameter usage in curl
  </Col>
</Row>

## Laboratory Endpoints

### Registered Samples {{ tag: 'GET', label: '/hiv/vl/laboratories/registered_samples/' }}

<Row>
  <Col>
    Description of what this endpoint returns.
    Response fields documentation.
  </Col>
  <Col sticky>
    <CodeGroup title="Request" tag="GET" label="/hiv/vl/laboratories/registered_samples/">
      curl, Python, JavaScript examples
    </CodeGroup>
    JSON response example
  </Col>
</Row>

### Tested Samples {{ tag: 'GET', label: '/hiv/vl/laboratories/tested_samples/' }}
...

## Facility Endpoints
### Registered Samples {{ tag: 'GET', label: '/hiv/vl/facilities/registered_samples/' }}
...

## Summary Endpoints
### Header Indicators {{ tag: 'GET', label: '/hiv/vl/summary/header_indicators/' }}
...
```

**Endpoints per page:**

| Page | Laboratory | Facility | Summary | Patients | Total |
|------|-----------|----------|---------|----------|-------|
| HIV Viral Load | 15 | 14 | 6 | — | 35 |
| HIV EID | 11 | 14 | 10 | — | 35 |
| TB GeneXpert | 18 | 18 | 6 | 4 | 46 |

**EID-specific parameters:** `lab_type` (conventional, poc, all) is documented in EID's Common Parameters.

**TB-specific parameters:** `genexpert_result_type` (Ultra 6 Cores, XDR 10 Cores) is documented in TB's Common Parameters.

### 4.5 Placeholder Pages

HIV Advanced Disease and TB Cultura pages show:
- Title and brief description of the test type
- "Coming soon" note with expected sub-tests (CD4, CrAg, TB-LAM for AD; Culture and Sensitivity for Cultura)
- No endpoint documentation yet

---

## 5. Component Changes

### 5.1 New Components

| Component | Purpose |
|-----------|---------|
| `LanguageToggle` | EN/PT toggle button in Header |
| `Tests` | Grid of test cards for Introduction page (replaces Resources). Uses a 3+2 grid layout (`xl:grid-cols-3`) to accommodate 5 cards without orphans |

### 5.2 Modified Components

| Component | Change |
|-----------|--------|
| `Navigation.tsx` | Replace hardcoded `navigation` array with `getNavigation(locale)` function |
| `Header.tsx` | Add `LanguageToggle` next to `ThemeToggle` |
| `Layout.tsx` | Extract locale from pathname, pass to Navigation |
| `Footer.tsx` | Derive locale from `usePathname()`, call `getNavigation(locale)` for prev/next links. Localize "Previous"/"Next" labels ("Anterior"/"Seguinte" in PT) |
| `MobileNavigation.tsx` | Use `getNavigation(locale)` instead of static import (same approach as Navigation.tsx) |
| `src/app/layout.tsx` | Move to `src/app/[locale]/layout.tsx`, receive `locale` param, set `<html lang={locale}>` |
| `Header.tsx` | Add `LanguageToggle` next to `ThemeToggle`. Remove or update hardcoded top-level nav items ("API", "Documentation", "Support", "Sign in") — replace with contextual links relevant to OpenLDR |
| `Logo.tsx` | Update to show "OpenLDR" branding |

### 5.3 Removed/Replaced Components

| Component | Action |
|-----------|--------|
| `Resources.tsx` | Replaced by `Tests.tsx` with test-specific data |
| `Libraries.tsx` | Removed (not relevant) |
| Template MDX pages (contacts, conversations, etc.) | Removed, replaced with API doc pages |

---

## 6. Files to Delete

All template placeholder pages:
- `src/app/contacts/`
- `src/app/conversations/`
- `src/app/messages/`
- `src/app/groups/`
- `src/app/attachments/`
- `src/app/authentication/`
- `src/app/pagination/`
- `src/app/errors/`
- `src/app/webhooks/`
- `src/app/sdks/`
- `src/app/quickstart/`
- `src/app/page.mdx`

---

## 7. Search

The search indexer (`src/mdx/search.mjs`) generates URLs by stripping `page.mdx` from glob results. With `[locale]` routing, the index will contain both `/en/...` and `/pt/...` URLs.

**Required changes:**
- **Search component** (`Search.tsx`): Derive the current locale from `usePathname()` and filter search results to only show matches from the current locale. The navigation title lookup must use `getNavigation(locale)` instead of importing the static `navigation` array.
- **Search index**: No structural changes needed — the indexer will naturally index both locales. Filtering happens at query time in the client component.

**Known limitation:** Search results are filtered by locale. Users searching in English won't see Portuguese results and vice versa. This is the expected behavior.

---

## 8. Build & Config

### next.config.mjs
No structural changes. Verify that `outputFileTracingIncludes` pattern (`'./src/app/**/*.mdx'`) still captures MDX files under the `[locale]` directory — it should, since `**` matches nested directories.

### Static Generation
`generateStaticParams` goes in `src/app/[locale]/layout.tsx` only — it returns `[{ locale: 'en' }, { locale: 'pt' }]`. MDX pages do not need individual wrappers since the layout-level `generateStaticParams` covers the `[locale]` segment for all child routes.

### Section Map (`allSections`)
The root layout globs MDX files and builds a URL-keyed map of sections. After moving to `src/app/[locale]/layout.tsx`:
- The glob `cwd` remains `'src/app'` (glob runs from project root)
- The key computation produces paths like `/en/hiv/viral-load` which correctly matches `usePathname()` output
- Both locale variants are included in the map — `Layout.tsx` looks up the current path and finds the correct sections

### Locale Type
A shared `Locale` type alias (`type Locale = 'en' | 'pt'`) is defined in `src/lib/locale.ts` alongside `getLocaleFromPathname()` and `getNavigation()`. This centralizes all locale logic.

---

## 9. Scope Exclusions

- No API playground / "try it" functionality
- No automated Swagger-to-MDX generation — pages are hand-crafted for quality
- No third language support
- No cookie-based locale persistence (URL is the source of truth)
- Dictionary and Auth endpoints are documented only in Quickstart (not their own pages)
- Invalid locale values (e.g., `/fr/quickstart`) fall through to Next.js 404 — no custom locale validation needed
- The root `src/app/page.tsx` only handles `/` → `/en/` redirect
