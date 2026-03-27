# OpenLDR API Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (EN/PT) API documentation site for the OpenLDR Analytics API using the Tailwind Plus Protocol template.

**Architecture:** Next.js 16 app with static locale directories (`src/app/en/` and `src/app/pt/`). Each locale has its own set of MDX pages with translated content. A shared locale utility module provides navigation config and locale detection. Search, section tracking, and prev/next navigation all work natively because MDX pages exist as real files.

**Tech Stack:** Next.js 16.1.6, React 19, Tailwind CSS 4, MDX 3, FlexSearch, Framer Motion, Zustand

**Spec:** `docs/superpowers/specs/2026-03-25-openldr-api-docs-design.md`

**Working directory:** `/home/vagner/Documents/Projects/APHL/openldr/openldr-monorepo/apps/api-documentation`

**Why static directories instead of `[locale]` dynamic segment:** The Protocol template's search indexer and section map both glob for `**/*.mdx` files. Using `.mdx` pages with static directories (`en/`, `pt/`) means search, section tracking, and prev/next navigation all work without modifying the build pipeline. A `[locale]` dynamic segment would require `.tsx` pages (since MDX can't export `generateStaticParams`), breaking both search and section tracking.

---

## File Structure

### New Files
```
src/lib/locale.ts                              → Locale type, getLocaleFromPathname(), getNavigation(), getLabels()
src/components/LanguageToggle.tsx               → EN/PT toggle button
src/components/Tests.tsx                        → Test cards grid (replaces Resources)
src/app/page.tsx                               → Root redirect / → /en/
src/app/en/page.mdx                            → Introduction (English)
src/app/en/quickstart/page.mdx                 → Quickstart (English)
src/app/en/openldr-data/page.mdx               → OpenLDR Data (English)
src/app/en/hiv/viral-load/page.mdx             → HIV VL endpoints (English)
src/app/en/hiv/eid/page.mdx                    → HIV EID endpoints (English)
src/app/en/hiv/advanced-disease/page.mdx       → Placeholder (English)
src/app/en/tb/genexpert/page.mdx               → TB GeneXpert endpoints (English)
src/app/en/tb/cultura/page.mdx                 → Placeholder (English)
src/app/pt/page.mdx                            → Introduction (Portuguese)
src/app/pt/quickstart/page.mdx                 → Quickstart (Portuguese)
src/app/pt/openldr-data/page.mdx               → OpenLDR Data (Portuguese)
src/app/pt/hiv/viral-load/page.mdx             → HIV VL endpoints (Portuguese)
src/app/pt/hiv/eid/page.mdx                    → HIV EID endpoints (Portuguese)
src/app/pt/hiv/advanced-disease/page.mdx       → Placeholder (Portuguese)
src/app/pt/tb/genexpert/page.mdx               → TB GeneXpert endpoints (Portuguese)
src/app/pt/tb/cultura/page.mdx                 → Placeholder (Portuguese)
```

### Modified Files
```
src/components/Navigation.tsx:235-270      → Replace static navigation with getNavigation(locale), update Navigation component to accept locale prop
src/components/Header.tsx:81-97            → Add LanguageToggle, remove template nav items and sign-in
src/components/Footer.tsx:1-70             → Locale-aware PageNavigation with translated labels
src/components/MobileNavigation.tsx        → Pass locale to <Navigation /> component
src/components/Layout.tsx                  → Derive locale from pathname, pass to Navigation
src/components/Logo.tsx                    → OpenLDR branding text
src/components/Search.tsx                  → Filter search results by current locale
src/app/layout.tsx                         → Update metadata title to "OpenLDR Analytics API"
src/app/not-found.tsx                      → Update branding text
```

### Deleted Files
```
src/app/page.mdx
src/app/contacts/
src/app/conversations/
src/app/messages/
src/app/groups/
src/app/attachments/
src/app/authentication/
src/app/pagination/
src/app/errors/
src/app/webhooks/
src/app/sdks/
src/app/quickstart/
src/components/Resources.tsx
src/components/Libraries.tsx
src/components/Guides.tsx
```

---

## Task 1: Create locale utility module

**Files:**
- Create: `src/lib/locale.ts`

- [ ] **Step 1: Create `src/lib/locale.ts`**

```typescript
export type Locale = 'en' | 'pt'

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split('/')[1]
  return segment === 'pt' ? 'pt' : 'en'
}

export interface NavLink {
  title: string
  href: string
}

export interface NavGroup {
  title: string
  links: NavLink[]
}

export function getNavigation(locale: Locale): NavGroup[] {
  const prefix = `/${locale}`

  if (locale === 'pt') {
    return [
      {
        title: 'Guia',
        links: [
          { title: 'Introdução', href: `${prefix}/` },
          { title: 'Início Rápido', href: `${prefix}/quickstart` },
          { title: 'Dados OpenLDR', href: `${prefix}/openldr-data` },
        ],
      },
      {
        title: 'Testes',
        links: [
          { title: 'HIV Carga Viral', href: `${prefix}/hiv/viral-load` },
          { title: 'HIV Diagnóstico Infantil Precoce', href: `${prefix}/hiv/eid` },
          { title: 'HIV Doença Avançada', href: `${prefix}/hiv/advanced-disease` },
          { title: 'TB GeneXpert', href: `${prefix}/tb/genexpert` },
          { title: 'TB Cultura', href: `${prefix}/tb/cultura` },
        ],
      },
    ]
  }

  return [
    {
      title: 'Guide',
      links: [
        { title: 'Introduction', href: `${prefix}/` },
        { title: 'Quickstart', href: `${prefix}/quickstart` },
        { title: 'OpenLDR Data', href: `${prefix}/openldr-data` },
      ],
    },
    {
      title: 'Tests',
      links: [
        { title: 'HIV Viral Load', href: `${prefix}/hiv/viral-load` },
        { title: 'HIV Early Infant Diagnosis', href: `${prefix}/hiv/eid` },
        { title: 'HIV Advanced Disease', href: `${prefix}/hiv/advanced-disease` },
        { title: 'TB GeneXpert', href: `${prefix}/tb/genexpert` },
        { title: 'TB Cultura', href: `${prefix}/tb/cultura` },
      ],
    },
  ]
}

export function getLabels(locale: Locale) {
  return locale === 'pt'
    ? { previous: 'Anterior', next: 'Seguinte', readMore: 'Saiba mais', comingSoon: 'Em breve' }
    : { previous: 'Previous', next: 'Next', readMore: 'Read more', comingSoon: 'Coming soon' }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/locale.ts
git commit -m "feat: add locale utility module with navigation config and type definitions"
```

---

## Task 2: Delete template placeholder files

**Files:**
- Delete: All template pages and unused components

- [ ] **Step 1: Delete template pages and unused components**

```bash
rm -rf src/app/contacts src/app/conversations src/app/messages src/app/groups src/app/attachments src/app/authentication src/app/pagination src/app/errors src/app/webhooks src/app/sdks src/app/quickstart
rm src/app/page.mdx
rm src/components/Resources.tsx src/components/Libraries.tsx src/components/Guides.tsx
```

- [ ] **Step 2: Commit**

```bash
git add -u
git commit -m "chore: remove template placeholder pages and unused components"
```

---

## Task 3: Create root redirect and update layout metadata

**Files:**
- Create: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/not-found.tsx`

- [ ] **Step 1: Create `src/app/page.tsx` (root redirect)**

```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/en/')
}
```

- [ ] **Step 2: Update `src/app/layout.tsx` metadata**

Change the metadata title from "Protocol API Reference" to "OpenLDR Analytics API":

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s - OpenLDR Analytics API',
    default: 'OpenLDR Analytics API',
  },
}
```

The rest of the layout (glob, allSections, Providers, Layout) stays unchanged — it will automatically pick up the new pages under `en/` and `pt/`.

- [ ] **Step 3: Update `src/app/not-found.tsx`**

Update the text content: change "Protocol" references to "OpenLDR". Change "Back to docs" link href to `/en/`.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx src/app/not-found.tsx
git commit -m "feat: add root redirect to /en/ and update metadata to OpenLDR branding"
```

---

## Task 4: Update Navigation to be locale-aware

**Files:**
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Update Navigation.tsx**

At the top of the file, add import:
```typescript
import { getNavigation, getLocaleFromPathname, type NavGroup } from '@/lib/locale'
```

Replace the static `navigation` array export (lines 235-258) with:
```typescript
// Default navigation for backwards compatibility (used by Search, Footer before locale-awareness)
export const navigation: Array<NavGroup> = getNavigation('en')
```

Update the `Navigation` component function signature to accept an optional `locale` prop. The component currently starts at line 260. Change:
```typescript
export function Navigation(props: React.ComponentPropsWithoutRef<'nav'>) {
```
to:
```typescript
export function Navigation({
  locale,
  ...props
}: React.ComponentPropsWithoutRef<'nav'> & { locale?: string }) {
  const nav = locale ? getNavigation(locale as 'en' | 'pt') : navigation
```

Then replace `navigation` references inside the component's JSX with `nav`:
```typescript
  return (
    <nav {...props}>
      <ul role="list">
        {nav.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}
```

Remove the hardcoded `<TopLevelNavItem href="/">API</TopLevelNavItem>` line that was previously rendered before the NavigationGroup mapping.

- [ ] **Step 2: Update Layout.tsx**

Add import:
```typescript
import { getLocaleFromPathname } from '@/lib/locale'
```

In the `Layout` component, derive locale from pathname (after the existing `let pathname = usePathname()` line):
```typescript
let locale = getLocaleFromPathname(pathname)
```

Update the Navigation render to pass locale:
```typescript
<Navigation className="hidden lg:mt-10 lg:block" locale={locale} />
```

Also update the Logo home link href from `"/"` to `{`/${locale}/`}`:
```typescript
<Link href={`/${locale}/`} aria-label="Home">
  <Logo className="h-6" />
</Link>
```

- [ ] **Step 3: Verify build**

Run: `npx next build --webpack 2>&1 | tail -10`

- [ ] **Step 4: Commit**

```bash
git add src/components/Navigation.tsx src/components/Layout.tsx
git commit -m "feat: make Navigation locale-aware with getNavigation()"
```

---

## Task 5: Create LanguageToggle and update Header

**Files:**
- Create: `src/components/LanguageToggle.tsx`
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: Create `src/components/LanguageToggle.tsx`**

```typescript
'use client'

import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { getLocaleFromPathname, type Locale } from '@/lib/locale'

export function LanguageToggle() {
  let pathname = usePathname()
  let router = useRouter()
  let currentLocale = getLocaleFromPathname(pathname)

  function switchLocale(newLocale: Locale) {
    if (newLocale === currentLocale) return
    let newPath = pathname.replace(/^\/(en|pt)/, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={clsx(
          'rounded px-1.5 py-0.5 text-xs font-semibold transition',
          currentLocale === 'en'
            ? 'bg-zinc-900/10 text-zinc-900 dark:bg-white/10 dark:text-white'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
        )}
        onClick={() => switchLocale('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={clsx(
          'rounded px-1.5 py-0.5 text-xs font-semibold transition',
          currentLocale === 'pt'
            ? 'bg-zinc-900/10 text-zinc-900 dark:bg-white/10 dark:text-white'
            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
        )}
        onClick={() => switchLocale('pt')}
      >
        PT
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Update Header.tsx**

Add import:
```typescript
import { LanguageToggle } from '@/components/LanguageToggle'
```

Replace lines 81-96 (the right-side `<div className="flex items-center gap-5">` block) with:
```typescript
      <div className="flex items-center gap-5">
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <div className="flex gap-4">
          <MobileSearch />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
```

This removes the hardcoded "API", "Documentation", "Support" nav items and the "Sign in" button.

- [ ] **Step 3: Commit**

```bash
git add src/components/LanguageToggle.tsx src/components/Header.tsx
git commit -m "feat: add language toggle (EN/PT) to header"
```

---

## Task 6: Update Footer with locale-aware navigation

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Update Footer.tsx imports and PageNavigation function**

Replace lines 1-70 (imports through end of PageNavigation) with:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/Button'
import { getNavigation, getLocaleFromPathname, getLabels } from '@/lib/locale'

function PageLink({
  label,
  page,
  previous = false,
}: {
  label: string
  page: { href: string; title: string }
  previous?: boolean
}) {
  return (
    <>
      <Button
        href={page.href}
        aria-label={`${label}: ${page.title}`}
        variant="secondary"
        arrow={previous ? 'left' : 'right'}
      >
        {label}
      </Button>
      <Link
        href={page.href}
        tabIndex={-1}
        aria-hidden="true"
        className="text-base font-semibold text-zinc-900 transition hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
      >
        {page.title}
      </Link>
    </>
  )
}

function PageNavigation() {
  let pathname = usePathname()
  let locale = getLocaleFromPathname(pathname)
  let navigation = getNavigation(locale)
  let labels = getLabels(locale)
  let allPages = navigation.flatMap((group) => group.links)
  let currentPageIndex = allPages.findIndex((page) => page.href === pathname)

  if (currentPageIndex === -1) {
    return null
  }

  let previousPage = allPages[currentPageIndex - 1]
  let nextPage = allPages[currentPageIndex + 1]

  if (!previousPage && !nextPage) {
    return null
  }

  return (
    <div className="flex">
      {previousPage && (
        <div className="flex flex-col items-start gap-3">
          <PageLink label={labels.previous} page={previousPage} previous />
        </div>
      )}
      {nextPage && (
        <div className="ml-auto flex flex-col items-end gap-3">
          <PageLink label={labels.next} page={nextPage} />
        </div>
      )}
    </div>
  )
}
```

Keep the rest of the file (XIcon, GitHubIcon, DiscordIcon, SocialLink, SmallPrint, Footer export) unchanged.

- [ ] **Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: locale-aware footer with translated Previous/Next labels"
```

---

## Task 7: Update MobileNavigation and Logo

**Files:**
- Modify: `src/components/MobileNavigation.tsx`
- Modify: `src/components/Logo.tsx`

- [ ] **Step 1: Update MobileNavigation.tsx**

The MobileNavigation component renders `<Navigation />` inside a Dialog. Since Task 4 added the `locale` prop to Navigation, update MobileNavigation to pass it.

Add import:
```typescript
import { getLocaleFromPathname } from '@/lib/locale'
```

Inside the component that renders `<Navigation />`, derive locale from pathname (the component already has access to `usePathname` or can add it):
```typescript
let pathname = usePathname()
let locale = getLocaleFromPathname(pathname)
```

Update the `<Navigation />` render to:
```typescript
<Navigation locale={locale} />
```

Also update any home link from `href="/"` to `href={`/${locale}/`}`.

- [ ] **Step 2: Update Logo.tsx**

Replace the entire content of `src/components/Logo.tsx` with:

```typescript
export function Logo(props: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div {...props} className={`flex items-center gap-2 ${props.className ?? ''}`}>
      <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
        Open<span className="text-emerald-500">LDR</span>
      </span>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MobileNavigation.tsx src/components/Logo.tsx
git commit -m "feat: locale-aware mobile navigation and OpenLDR logo branding"
```

---

## Task 8: Update Search for locale filtering

**Files:**
- Modify: `src/components/Search.tsx`

- [ ] **Step 1: Update Search.tsx**

Add import:
```typescript
import { getLocaleFromPathname, getNavigation } from '@/lib/locale'
```

In the Search component, the `useAutocomplete` hook has a `getSources` function that returns search results. Find where the search results are filtered/returned and add locale filtering.

The key changes:
1. Derive locale from `usePathname()`:
   ```typescript
   let locale = getLocaleFromPathname(pathname)
   ```

2. Replace the `navigation` import with locale-aware navigation:
   ```typescript
   let nav = getNavigation(locale)
   ```

3. In the search results filtering (inside `getSources` → `getItems`), filter results to current locale:
   ```typescript
   .filter((item) => item.url.startsWith(`/${locale}/`))
   ```

4. Where navigation is used to look up page titles for search results, use `nav` instead of the static `navigation` import.

- [ ] **Step 2: Commit**

```bash
git add src/components/Search.tsx
git commit -m "feat: filter search results by current locale"
```

---

## Task 9: Create Tests component

**Files:**
- Create: `src/components/Tests.tsx`

- [ ] **Step 1: Create `src/components/Tests.tsx`**

```typescript
'use client'

import { usePathname } from 'next/navigation'

import { Heading } from '@/components/Heading'
import { Button } from '@/components/Button'
import { getLocaleFromPathname, getLabels } from '@/lib/locale'

const testsData = {
  en: [
    { name: 'HIV Viral Load', description: 'Viral load suppression monitoring and reporting endpoints.', slug: 'hiv/viral-load' },
    { name: 'HIV Early Infant Diagnosis', description: 'PCR-based early diagnosis for HIV-exposed infants.', slug: 'hiv/eid' },
    { name: 'HIV Advanced Disease', description: 'CD4, CrAg, and TB-LAM testing.', slug: 'hiv/advanced-disease', comingSoon: true },
    { name: 'TB GeneXpert', description: 'GeneXpert MTB/RIF Ultra and XDR testing endpoints.', slug: 'tb/genexpert' },
    { name: 'TB Cultura', description: 'TB culture and sensitivity testing.', slug: 'tb/cultura', comingSoon: true },
  ],
  pt: [
    { name: 'HIV Carga Viral', description: 'Endpoints de monitoramento e relatórios de supressão de carga viral.', slug: 'hiv/viral-load' },
    { name: 'HIV Diagnóstico Infantil Precoce', description: 'Diagnóstico precoce baseado em PCR para crianças expostas ao HIV.', slug: 'hiv/eid' },
    { name: 'HIV Doença Avançada', description: 'Testes de CD4, CrAg e TB-LAM.', slug: 'hiv/advanced-disease', comingSoon: true },
    { name: 'TB GeneXpert', description: 'Endpoints de testes GeneXpert MTB/RIF Ultra e XDR.', slug: 'tb/genexpert' },
    { name: 'TB Cultura', description: 'Testes de cultura e sensibilidade de TB.', slug: 'tb/cultura', comingSoon: true },
  ],
}

export function Tests() {
  let pathname = usePathname()
  let locale = getLocaleFromPathname(pathname)
  let tests = testsData[locale]
  let labels = getLabels(locale)
  let heading = locale === 'pt' ? 'Testes' : 'Tests'

  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="tests">
        {heading}
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-3 dark:border-white/5">
        {tests.map((test) => (
          <div key={test.slug}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
              {test.name}
              {test.comingSoon && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {labels.comingSoon}
                </span>
              )}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {test.description}
            </p>
            <p className="mt-4">
              <Button href={`/${locale}/${test.slug}`} variant="text" arrow="right">
                {labels.readMore}
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Tests.tsx
git commit -m "feat: add bilingual Tests component with 5 test cards grid"
```

---

## Task 10: Create English Introduction page

**Files:**
- Create: `src/app/en/page.mdx`

- [ ] **Step 1: Create `src/app/en/page.mdx`**

```mdx
import { Tests } from '@/components/Tests'
import { HeroPattern } from '@/components/HeroPattern'

export const metadata = {
  title: 'OpenLDR Analytics API',
  description: 'API documentation for the OpenLDR Analytics platform for laboratory data management.',
}

export const sections = [
  { title: 'Tests', id: 'tests' },
]

<HeroPattern />

# OpenLDR Analytics API

The OpenLDR Analytics API provides RESTful endpoints for laboratory test reporting and analytics across HIV and TB diagnostic programs. Built on the OpenLDR (Open Laboratory Data Repository) platform, it enables programmatic access to aggregated laboratory data for public health surveillance and reporting. {{ className: 'lead' }}

<div className="not-prose mt-4 mb-8 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
  <p className="text-sm font-medium text-zinc-900 dark:text-white">
    Base URL: <code className="text-emerald-500">https://api.openldr.org.mz</code>
  </p>
  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
    Authentication: JWT Bearer token via <code>POST /auth/login</code>
  </p>
</div>

<div className="not-prose mt-6 mb-16 flex gap-3">
  <Button href="/en/quickstart" arrow="right">
    <>Quickstart</>
  </Button>
  <Button href="/en/openldr-data" variant="outline">
    <>OpenLDR Data</>
  </Button>
</div>

<Tests />
```

- [ ] **Step 2: Verify build**

Run: `npx next build --webpack 2>&1 | tail -15`

Expected: `/en` route appears in output.

- [ ] **Step 3: Commit**

```bash
git add src/app/en/page.mdx
git commit -m "feat: add English Introduction page with Tests grid"
```

---

## Task 11: Create Portuguese Introduction page

**Files:**
- Create: `src/app/pt/page.mdx`

- [ ] **Step 1: Create `src/app/pt/page.mdx`**

Same structure as English but with Portuguese content:
- Title: "OpenLDR Analytics API"
- Lead: Portuguese description of the API
- Button labels: "Início Rápido", "Dados OpenLDR"
- Links: `/pt/quickstart`, `/pt/openldr-data`
- Uses same `<Tests />` component (auto-detects locale)

- [ ] **Step 2: Commit**

```bash
git add src/app/pt/page.mdx
git commit -m "feat: add Portuguese Introduction page"
```

---

## Task 12: Create English Quickstart page

**Files:**
- Create: `src/app/en/quickstart/page.mdx`

- [ ] **Step 1: Create English Quickstart page**

Content sections (using MDX components Row, Col, Properties, Property, CodeGroup, Note):

**Authentication:**
```mdx
## Authentication {{ tag: 'POST', label: '/auth/login' }}

<Row>
  <Col>
    All API endpoints require a JWT Bearer token. Obtain one by posting credentials to the login endpoint.

    ### Request body

    <Properties>
      <Property name="user_name" type="string">
        Your username.
      </Property>
      <Property name="password" type="string">
        Your password.
      </Property>
    </Properties>
  </Col>
  <Col sticky>
    <CodeGroup title="Request" tag="POST" label="/auth/login">
    ```bash {{ title: 'cURL' }}
    curl -X POST https://api.openldr.org.mz/auth/login \
      -H "Content-Type: application/json" \
      -d '{"user_name": "your_user", "password": "your_password"}'
    ```
    ```python {{ title: 'Python' }}
    import requests

    response = requests.post(
        "https://api.openldr.org.mz/auth/login",
        json={"user_name": "your_user", "password": "your_password"}
    )
    token = response.json()["access_token"]
    ```
    ```js {{ title: 'JavaScript' }}
    const response = await fetch('https://api.openldr.org.mz/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: 'your_user', password: 'your_password' }),
    })
    const { access_token } = await response.json()
    ```
    </CodeGroup>
    ```json {{ title: 'Response' }}
    {
      "access_token": "eyJhbGciOiJIUzI1NiIs..."
    }
    ```
  </Col>
</Row>
```

**Common Parameters:**
```mdx
## Common Parameters {{ tag: 'ALL', label: 'Query Parameters' }}

<Row>
  <Col>
    All reporting endpoints accept these standard query parameters.

    <Properties>
      <Property name="interval_dates" type="JSON array">
        Date range filter. Format: `["YYYY-MM-DD", "YYYY-MM-DD"]`. Defaults to last 12 months.
      </Property>
      <Property name="province" type="string">
        Province name filter. Can be specified multiple times for multi-select.
      </Property>
      <Property name="district" type="string">
        District name filter. Can be specified multiple times.
      </Property>
      <Property name="health_facility" type="string">
        Specific health facility name.
      </Property>
      <Property name="facility_type" type="string">
        Grouping level: `province`, `district`, or `health_facility`.
      </Property>
      <Property name="disaggregation" type="string">
        Enable data breakdown: `True` or `False`.
      </Property>
    </Properties>
  </Col>
  <Col sticky>
    <CodeGroup title="Example Request" tag="GET" label="/hiv/vl/laboratories/tested_samples/">
    ```bash {{ title: 'cURL' }}
    curl -G https://api.openldr.org.mz/hiv/vl/laboratories/tested_samples/ \
      -H "Authorization: Bearer {token}" \
      --data-urlencode 'interval_dates=["2025-01-01","2025-12-31"]' \
      --data-urlencode 'province=Maputo Cidade'
    ```
    </CodeGroup>
  </Col>
</Row>
```

**Error Handling:**
Document 200, 401, 500 response codes with examples.

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/app/en/quickstart/
git commit -m "feat: add English Quickstart page with auth and common params docs"
```

---

## Task 13: Create Portuguese Quickstart page

**Files:**
- Create: `src/app/pt/quickstart/page.mdx`

- [ ] **Step 1: Create Portuguese Quickstart**

Same structure as English with translated prose. Code examples stay in English (they are code). Section titles, descriptions, and property descriptions are in Portuguese.

- [ ] **Step 2: Commit**

```bash
git add src/app/pt/quickstart/
git commit -m "feat: add Portuguese Quickstart page"
```

---

## Task 14: Create English OpenLDR Data page

**Files:**
- Create: `src/app/en/openldr-data/page.mdx`

- [ ] **Step 1: Create OpenLDR Data page**

Comprehensive single-page documentation about OpenLDR. Sections:

1. **What is OpenLDR** — Centralized national lab data repository. "Good Infrastructure = Better Data = Increase Demand for Data = Better Patient Outcomes."
2. **Design Principles** — Simplicity, report-oriented design, anonymous patient data, international standards (SI units, HL7 v2.5, LOINC, ICD-10), multi-level applicability
3. **Data Model** — Two databases: OpenLDRData (Requests/OBR, LabResults/OBX, Monitoring, VersionControl) and OpenLDRDict (standardized lookup tables). Use `<Properties>` components to document key table fields.
4. **Data Flow** — XML import from LIS/instruments → MirthConnect → OpenLDR database → Analytics API
5. **Multi-Country Model** — Sovereign data control per country, shared technology ecosystem

Use `<Note>` components for important callouts. Use `<Row>/<Col>` for side-by-side layouts where appropriate.

- [ ] **Step 2: Commit**

```bash
git add src/app/en/openldr-data/
git commit -m "feat: add English OpenLDR Data page with platform documentation"
```

---

## Task 15: Create Portuguese OpenLDR Data page

**Files:**
- Create: `src/app/pt/openldr-data/page.mdx`

- [ ] **Step 1: Translate OpenLDR Data page to Portuguese**

- [ ] **Step 2: Commit**

```bash
git add src/app/pt/openldr-data/
git commit -m "feat: add Portuguese OpenLDR Data page"
```

---

## Task 16: Create English HIV Viral Load endpoint docs

**Files:**
- Create: `src/app/en/hiv/viral-load/page.mdx`

- [ ] **Step 1: Create VL endpoint documentation**

Document all 35 HIV VL endpoints. Structure:

```mdx
export const metadata = {
  title: 'HIV Viral Load',
  description: 'API endpoints for HIV Viral Load testing analytics.',
}

export const sections = [
  { title: 'Common Parameters', id: 'common-parameters' },
  { title: 'Laboratory Endpoints', id: 'laboratory-endpoints' },
  { title: 'Registered Samples', id: 'registered-samples', tag: 'GET', label: '/hiv/vl/laboratories/registered_samples/' },
  // ... one section per endpoint for sidebar TOC
  { title: 'Facility Endpoints', id: 'facility-endpoints' },
  // ...
  { title: 'Summary Endpoints', id: 'summary-endpoints' },
  // ...
]
```

**Each endpoint follows this pattern:**

```mdx
### Registered Samples {{ tag: 'GET', label: '/hiv/vl/laboratories/registered_samples/' }}

<Row>
  <Col>
    Returns registered sample counts grouped by year/month with viral suppression breakdown and gender stratification.

    **Response fields:**
    <Properties>
      <Property name="year" type="integer">Year of analysis</Property>
      <Property name="month" type="integer">Month number</Property>
      <Property name="month_name" type="string">Month name</Property>
      <Property name="total" type="integer">Total samples</Property>
      <Property name="suppressed" type="integer">Virally suppressed count</Property>
      <Property name="not_suppressed" type="integer">Not suppressed count</Property>
      <Property name="male_suppressed" type="integer">Male suppressed count</Property>
      <Property name="female_suppressed" type="integer">Female suppressed count</Property>
    </Properties>
  </Col>
  <Col sticky>
    <CodeGroup title="Request" tag="GET" label="/hiv/vl/laboratories/registered_samples/">
    ```bash {{ title: 'cURL' }}
    curl -G https://api.openldr.org.mz/hiv/vl/laboratories/registered_samples/ \
      -H "Authorization: Bearer {token}" \
      --data-urlencode 'interval_dates=["2025-01-01","2025-12-31"]'
    ```
    ```python {{ title: 'Python' }}
    import requests

    response = requests.get(
        "https://api.openldr.org.mz/hiv/vl/laboratories/registered_samples/",
        headers={"Authorization": f"Bearer {token}"},
        params={"interval_dates": '["2025-01-01","2025-12-31"]'}
    )
    data = response.json()
    ```
    </CodeGroup>
    ```json {{ title: 'Response' }}
    [
      {
        "year": 2025,
        "month": 1,
        "month_name": "January",
        "total": 15234,
        "total_not_null": 14890,
        "total_null": 344,
        "suppressed": 12456,
        "not_suppressed": 2434,
        "male_suppressed": 5123,
        "male_not_suppressed": 1234,
        "female_suppressed": 7333,
        "female_not_suppressed": 1200
      }
    ]
    ```
  </Col>
</Row>
```

**Full endpoint list to document:**

Laboratory (15):
- registered_samples, registered_samples_by_month, tested_samples, tested_samples_by_month, tested_samples_by_gender, tested_samples_by_gender_by_lab, tested_samples_by_age, tested_samples_by_test_reason, tested_samples_pregnant, tested_samples_breastfeeding, rejected_samples, rejected_samples_by_month, tat_by_lab, tat_by_month, suppression

Facility (14):
- registered_samples, tested_samples_by_month, tested_samples_by_facility, tested_samples_by_gender, tested_samples_by_gender_by_facility, tested_samples_by_age, tested_samples_by_age_by_facility, tested_samples_by_test_reason, tested_samples_pregnant, tested_samples_breastfeeding, rejected_samples_by_month, rejected_samples_by_facility, tat_by_month, tat_by_facility

Summary (6):
- header_indicators, number_of_samples, viral_suppression, tat, suppression_by_province, samples_history

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/app/en/hiv/viral-load/
git commit -m "feat: add English HIV Viral Load endpoint documentation (35 endpoints)"
```

---

## Task 17: Create Portuguese HIV Viral Load endpoint docs

- [ ] **Step 1: Translate VL page to Portuguese** (prose and property descriptions; code stays English)

- [ ] **Step 2: Commit**

```bash
git add src/app/pt/hiv/viral-load/
git commit -m "feat: add Portuguese HIV Viral Load endpoint documentation"
```

---

## Task 18: Create English HIV EID endpoint docs

**Files:**
- Create: `src/app/en/hiv/eid/page.mdx`

- [ ] **Step 1: Create EID endpoint documentation**

Same pattern as VL. EID-specific differences:
- Additional parameter: `lab_type` (conventional, poc, all)
- Positivity instead of suppression (positive/negative counts)
- Age groups based on AgeInDays (0-2 months, 2-9 months, 9-18 months, 18+)
- Equipment-related endpoints (samples_by_equipment, samples_by_equipment_by_month)
- Sample routes endpoints (sample_routes, sample_routes_viewport)

Laboratory (11), Facility (14), Summary (10) = 35 endpoints total.

- [ ] **Step 2: Commit**

```bash
git add src/app/en/hiv/eid/
git commit -m "feat: add English HIV EID endpoint documentation (35 endpoints)"
```

---

## Task 19: Create Portuguese HIV EID endpoint docs

- [ ] **Step 1: Translate EID page to Portuguese**

- [ ] **Step 2: Commit**

```bash
git add src/app/pt/hiv/eid/
git commit -m "feat: add Portuguese HIV EID endpoint documentation"
```

---

## Task 20: Create English TB GeneXpert endpoint docs

**Files:**
- Create: `src/app/en/tb/genexpert/page.mdx`

- [ ] **Step 1: Create TB GeneXpert endpoint documentation**

TB-specific differences:
- Additional parameter: `genexpert_result_type` (Ultra 6 Cores, XDR 10 Cores)
- Positivity instead of suppression
- Drug resistance type endpoints (tested_samples_by_drug_type)
- Sample type endpoints (tested_samples_by_sample_types)
- Patient search endpoints (by_name, by_facility, by_sample_type, by_result_type)
- TRL (turnaround time) endpoints instead of TAT

Facilities (18), Laboratories (18), Summary (6), Patients (4) = 46 endpoints total.

- [ ] **Step 2: Commit**

```bash
git add src/app/en/tb/genexpert/
git commit -m "feat: add English TB GeneXpert endpoint documentation (46 endpoints)"
```

---

## Task 21: Create Portuguese TB GeneXpert endpoint docs

- [ ] **Step 1: Translate TB GeneXpert page to Portuguese**

- [ ] **Step 2: Commit**

```bash
git add src/app/pt/tb/genexpert/
git commit -m "feat: add Portuguese TB GeneXpert endpoint documentation"
```

---

## Task 22: Create placeholder pages (EN + PT)

**Files:**
- Create: `src/app/en/hiv/advanced-disease/page.mdx`
- Create: `src/app/pt/hiv/advanced-disease/page.mdx`
- Create: `src/app/en/tb/cultura/page.mdx`
- Create: `src/app/pt/tb/cultura/page.mdx`

- [ ] **Step 1: Create English HIV Advanced Disease placeholder**

```mdx
export const metadata = {
  title: 'HIV Advanced Disease',
  description: 'API endpoints for HIV Advanced Disease testing (CD4, CrAg, TB-LAM).',
}

export const sections = []

# HIV Advanced Disease

Endpoints for HIV Advanced Disease testing analytics are currently under development. This module will include: {{ className: 'lead' }}

<Note>
  This section is coming soon. The following test types will be documented once the API endpoints are implemented.
</Note>

## CD4 Count
CD4 cell count testing for immune status monitoring in HIV patients.

## CrAg (Cryptococcal Antigen)
Cryptococcal antigen testing for diagnosis of cryptococcal meningitis in advanced HIV disease.

## TB-LAM
Lateral flow urine lipoarabinomannan assay for TB diagnosis in HIV-positive patients with advanced immunosuppression.
```

- [ ] **Step 2: Create Portuguese HIV Advanced Disease placeholder**

Same structure, Portuguese content.

- [ ] **Step 3: Create English TB Cultura placeholder**

Similar structure for TB culture and sensitivity testing.

- [ ] **Step 4: Create Portuguese TB Cultura placeholder**

- [ ] **Step 5: Commit**

```bash
git add src/app/en/hiv/advanced-disease/ src/app/pt/hiv/advanced-disease/ src/app/en/tb/cultura/ src/app/pt/tb/cultura/
git commit -m "feat: add placeholder pages for Advanced Disease and TB Cultura (EN + PT)"
```

---

## Task 23: Final build and verification

- [ ] **Step 1: Full build**

```bash
cd /home/vagner/Documents/Projects/APHL/openldr/openldr-monorepo/apps/protocol
npx next build --webpack 2>&1 | tail -30
```

Expected: All routes generated for both `/en/` and `/pt/` locales. Should see 16+ routes.

- [ ] **Step 2: Dev server smoke test**

```bash
npx next dev --webpack -p 3333 &
sleep 10

# Test key routes
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/           # 307 redirect
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/en/        # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/pt/        # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/en/quickstart  # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/en/hiv/viral-load  # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/pt/hiv/viral-load  # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/en/tb/genexpert    # 200

kill %1
```

- [ ] **Step 3: Visual verification**

Start dev server and manually verify in browser:
- Language toggle switches between EN and PT correctly
- Navigation sidebar shows correct locale titles
- Search filters results by current locale
- Previous/Next footer navigation works with translated labels
- Tests grid on Introduction page links to correct locale paths
- Dark mode toggle still works

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete OpenLDR Analytics API documentation site"
```
