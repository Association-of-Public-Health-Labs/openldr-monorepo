import type { ReactNode } from "react";

export const ADPP_URL = "https://www.adpp-mozambique.org/";

export interface AuthBackdropProps {
  /** Full-page photo, e.g. "/login-bg.jpg" from the app's public folder. */
  backgroundSrc: string;
  /** CSS background for the colour wash over the photo (portal-tinted on sign-in). */
  tint?: string;
  /** The floating card; it is placed on the right (centred on small screens). */
  children: ReactNode;
}

/** Full-screen photo with the ADPP credit and a right-hand slot for the auth card. */
export function AuthBackdrop({ backgroundSrc, tint, children }: AuthBackdropProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0b0f0e]">
      <img
        src={backgroundSrc}
        alt="Crianças sorridentes numa escola em Moçambique"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div
        aria-hidden
        className="absolute inset-0 transition-[background] duration-500"
        style={{ background: tint ?? "linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35))" }}
      />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-8 sm:justify-end sm:px-10 lg:pr-[4vw]">
        {children}
      </div>

      <p className="absolute bottom-3 left-4 z-20 rounded-md bg-black/40 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
        Fotografia: ©{" "}
        <a
          href={ADPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-2 hover:text-white/80"
        >
          ADPP Moçambique
        </a>
      </p>
    </div>
  );
}
