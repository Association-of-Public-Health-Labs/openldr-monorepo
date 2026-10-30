"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SuggestionServices } from "./suggestion-endpoint";

const SuggestionContext = createContext<SuggestionServices | null>(null);

/** The dashboard supplies its module path and session authentication. */
export function SuggestionProvider({ children, ...services }: SuggestionServices & { children: ReactNode }) {
  return <SuggestionContext.Provider value={services}>{children}</SuggestionContext.Provider>;
}

export function useSuggestionServices() {
  return useContext(SuggestionContext);
}
