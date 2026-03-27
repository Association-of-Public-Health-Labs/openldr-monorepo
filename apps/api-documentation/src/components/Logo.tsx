export function Logo(props: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div {...props} className={`flex items-center gap-2 ${props.className ?? ''}`}>
      <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
        Open<span className="text-emerald-500">LDR</span> Analytics API
      </span>
    </div>
  )
}
