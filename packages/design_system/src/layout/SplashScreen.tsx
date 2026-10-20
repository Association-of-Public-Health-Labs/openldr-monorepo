"use client";

import { EMBLEM_URL } from "./shell-utils";

/**
 * Full-screen loader shown while the app starts, after the Minimals splash (minimals.cc, measured
 * 2026-10-19): the emblem pulses at the centre of a 120px box while two squares in the dashboard
 * colour turn in opposite directions and morph between rounded square and circle. Keyframes in theme.css.
 */
export function SplashScreen({ label = "A carregar…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="splash-screen"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-white dark:bg-[#141A21]"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden className="relative flex size-[120px] items-center justify-center">
        <img src={EMBLEM_URL} alt="" className="splash-logo size-16 object-contain" />
        <span className="splash-ring-inner absolute top-[10px] left-[10px] size-[100px] border-[3px]" />
        <span className="splash-ring-outer absolute inset-0 size-[120px] border-8" />
      </div>
    </div>
  );
}
