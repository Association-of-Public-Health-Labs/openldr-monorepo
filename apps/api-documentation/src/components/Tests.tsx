'use client'

import { usePathname } from 'next/navigation'

import { Heading } from '@/components/Heading'
import { Button } from '@/components/Button'
import { getLocaleFromPathname, getLabels } from '@/lib/locale'

const testsData = {
  en: [
    { name: 'HIV Viral Load', description: 'Viral load suppression monitoring and reporting endpoints.', slug: 'hiv/viral-load/summary' },
    { name: 'HIV Early Infant Diagnosis', description: 'PCR-based early diagnosis for HIV-exposed infants.', slug: 'hiv/eid/summary' },
    { name: 'HIV Advanced Disease', description: 'CD4, CrAg, and TB-LAM testing.', slug: 'hiv/advanced-disease', comingSoon: true },
    { name: 'TB GeneXpert', description: 'GeneXpert MTB/RIF Ultra and XDR testing endpoints.', slug: 'tb/genexpert/summary' },
    { name: 'TB Cultura', description: 'TB culture and sensitivity testing.', slug: 'tb/cultura', comingSoon: true },
  ],
  pt: [
    { name: 'HIV Carga Viral', description: 'Endpoints de monitoramento e relatórios de supressão de carga viral.', slug: 'hiv/viral-load/summary' },
    { name: 'HIV Diagnóstico Infantil Precoce', description: 'Diagnóstico precoce baseado em PCR para crianças expostas ao HIV.', slug: 'hiv/eid/summary' },
    { name: 'HIV Doença Avançada', description: 'Testes de CD4, CrAg e TB-LAM.', slug: 'hiv/advanced-disease', comingSoon: true },
    { name: 'TB GeneXpert', description: 'Endpoints de testes GeneXpert MTB/RIF Ultra e XDR.', slug: 'tb/genexpert/summary' },
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
