export const NOT_ENFORCED_NOTICE =
  "As permissões ainda não estão a ser aplicadas. Os dashboards e os dados de pacientes continuam a seguir as regras antigas até à activação.";

/** True only when the build was made with NEXT_PUBLIC_PERMISSIONS_ENFORCED=1, matching the API's flag. */
export function permissionsEnforced(value: string | undefined): boolean {
  return value === "1";
}
