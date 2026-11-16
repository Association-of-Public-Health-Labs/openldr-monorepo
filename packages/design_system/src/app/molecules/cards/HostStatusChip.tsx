import type { ReactNode } from "react";

export type HostStatusChipProps = {
  code: string;
  name: string;
  category: string;
  online: boolean;
  /** Makes the chip a button (e.g. to open the site's page). */
  onClick?: () => void;
};

/** One monitored site: a status circle with its code, then its name and category. */
export function HostStatusChip({ code, name, category, online, onClick }: HostStatusChipProps) {
  const status = online ? "online" : "offline";
  const body: ReactNode = (
    <>
      <span
        aria-hidden
        className={`flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full px-1 text-center text-[9.5px] font-bold leading-none tracking-tight text-white ${online ? "bg-success" : "bg-destructive"}`}
      >
        {code.slice(0, 5).toUpperCase()}
      </span>
      <span className="flex min-w-0 flex-col text-left">
        <span className="truncate text-[15px] font-semibold text-foreground">{name}</span>
        <span className="truncate text-[13px] text-muted-foreground">{category}</span>
      </span>
    </>
  );
  const className = "flex w-full min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3";
  const label = `${name}: ${status}`;
  return onClick ? (
    <button type="button" onClick={onClick} aria-label={label} className={`${className} cursor-pointer transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring`}>
      {body}
    </button>
  ) : (
    <div aria-label={label} className={className}>
      {body}
    </div>
  );
}
