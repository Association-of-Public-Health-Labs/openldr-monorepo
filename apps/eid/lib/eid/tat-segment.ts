import { TAT_SEGMENTS } from "@/lib/eid/series";
import type { Params } from "@repo/design_system/lib/report/params";

/** The segment shown on the first view; the API default, so no `category` is sent (hits the cache seed). */
export const DEFAULT_CATEGORY = 0;

/** `{}` for the default segment, `{category}` otherwise. */
export const categoryParams = (category: number): Params => (category !== DEFAULT_CATEGORY ? { category } : {});

/** "TRL - <segment label>", shared by the Sumário and Laboratório TRL cards. */
export const titleFor = (category: number) => `TRL - ${TAT_SEGMENTS[category]?.label ?? TAT_SEGMENTS[DEFAULT_CATEGORY].label}`;
