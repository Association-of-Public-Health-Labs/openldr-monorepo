import { validateIdentity } from "@/lib/admin/users";

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
}

/** Portuguese message per invalid field; empty object when valid. Dashboards are optional: an admin may invite first and grant later. */
export function validateUserForm(values: UserFormValues): Record<string, string> {
  return validateIdentity(values);
}

import type { DashboardId } from "@repo/design_system/dashboards";

/** Dashboards an admin can grant, with the short tag shown in the list (the admin dashboard itself is the separate admin switch). */
export const DASHBOARD_OPTIONS: { id: DashboardId; tag: string; label: string }[] = [
  { id: "vl", tag: "CV", label: "Carga Viral" },
  { id: "tb", tag: "TB", label: "Tuberculose" },
  { id: "eid", tag: "DPI", label: "DPI" },
];
