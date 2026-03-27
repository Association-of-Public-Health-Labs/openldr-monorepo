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
