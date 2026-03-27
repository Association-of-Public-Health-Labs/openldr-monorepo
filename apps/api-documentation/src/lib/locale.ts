export type Locale = 'en' | 'pt'

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split('/')[1]
  return segment === 'pt' ? 'pt' : 'en'
}

export interface NavLink {
  title: string
  href: string
  children?: NavLink[]
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
          {
            title: 'HIV Carga Viral',
            href: `${prefix}/hiv/viral-load`,
            children: [
              { title: 'Resumo', href: `${prefix}/hiv/viral-load/summary` },
              { title: 'Laboratório', href: `${prefix}/hiv/viral-load/laboratory` },
              { title: 'Unidades Sanitárias', href: `${prefix}/hiv/viral-load/facilities` },
            ],
          },
          {
            title: 'HIV Diagnóstico Infantil Precoce',
            href: `${prefix}/hiv/eid`,
            children: [
              { title: 'Resumo', href: `${prefix}/hiv/eid/summary` },
              { title: 'Laboratório', href: `${prefix}/hiv/eid/laboratory` },
              { title: 'Unidades Sanitárias', href: `${prefix}/hiv/eid/facilities` },
            ],
          },
          { title: 'HIV Doença Avançada', href: `${prefix}/hiv/advanced-disease` },
          {
            title: 'TB GeneXpert',
            href: `${prefix}/tb/genexpert`,
            children: [
              { title: 'Resumo', href: `${prefix}/tb/genexpert/summary` },
              { title: 'Laboratório', href: `${prefix}/tb/genexpert/laboratory` },
              { title: 'Unidades Sanitárias', href: `${prefix}/tb/genexpert/facilities` },
              { title: 'Pacientes', href: `${prefix}/tb/genexpert/patients` },
            ],
          },
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
        {
          title: 'HIV Viral Load',
          href: `${prefix}/hiv/viral-load`,
          children: [
            { title: 'Summary', href: `${prefix}/hiv/viral-load/summary` },
            { title: 'Laboratory', href: `${prefix}/hiv/viral-load/laboratory` },
            { title: 'Health Facilities', href: `${prefix}/hiv/viral-load/facilities` },
          ],
        },
        {
          title: 'HIV Early Infant Diagnosis',
          href: `${prefix}/hiv/eid`,
          children: [
            { title: 'Summary', href: `${prefix}/hiv/eid/summary` },
            { title: 'Laboratory', href: `${prefix}/hiv/eid/laboratory` },
            { title: 'Health Facilities', href: `${prefix}/hiv/eid/facilities` },
          ],
        },
        { title: 'HIV Advanced Disease', href: `${prefix}/hiv/advanced-disease` },
        {
          title: 'TB GeneXpert',
          href: `${prefix}/tb/genexpert`,
          children: [
            { title: 'Summary', href: `${prefix}/tb/genexpert/summary` },
            { title: 'Laboratory', href: `${prefix}/tb/genexpert/laboratory` },
            { title: 'Health Facilities', href: `${prefix}/tb/genexpert/facilities` },
            { title: 'Patients', href: `${prefix}/tb/genexpert/patients` },
          ],
        },
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
