import type { ReactNode } from "react";

export type HostStatusChipProps = {
  name: string;
  code: string;
  /** Where the site is, e.g. "Gaza · Xai-Xai". */
  location: string;
  online: boolean;
  /** When the status was last checked, e.g. "verificado há 1 min". */
  checked?: string;
  /** Makes the card a button (e.g. to open the site's page). */
  onClick?: () => void;
};

/**
 * One monitored site: name, code and location on top; a footer with the status written out and
 * when it was last checked. Only an offline site's footer is tinted, so a grid of many sites stays
 * calm while the offline ones still stand out (and the status never depends on colour alone).
 */
export function HostStatusChip({ name, code, location, online, checked, onClick }: HostStatusChipProps) {
  const status = online ? "online" : "offline";
  const body: ReactNode = (
    <>
      <span className="grid grid-cols-[1fr_auto] gap-x-2.5 gap-y-0.5 px-3 pb-2.5 pt-3 text-left">
        <span className="truncate text-[14.5px] font-semibold text-foreground">{name}</span>
        <span className="self-start pt-0.5 font-mono text-[11px] font-semibold tracking-wide text-muted-foreground">{code}</span>
        <span className="col-span-2 truncate text-[12.5px] text-muted-foreground">{location}</span>
      </span>
      <span
        className={`flex items-center justify-between gap-2 border-t px-3 py-1.5 text-xs ${
          online ? "border-border/60" : "border-destructive/25 bg-destructive/[0.07]"
        }`}
      >
        <span className={`inline-flex items-center gap-1.5 font-bold ${online ? "text-success" : "text-destructive"}`}>
          <span aria-hidden className="size-[7px] rounded-full bg-current" />
          {online ? "Online" : "Offline"}
        </span>
        {checked && <span className="truncate text-muted-foreground">{checked}</span>}
      </span>
    </>
  );
  const className = "flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card";
  const label = `${name}: ${status}`;
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${className} cursor-pointer transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
    >
      {body}
    </button>
  ) : (
    <div aria-label={label} className={className}>
      {body}
    </div>
  );
}
