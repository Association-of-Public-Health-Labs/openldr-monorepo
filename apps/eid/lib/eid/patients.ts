import { eidGet, type Params } from "./api";

/** The API caps per_page at 500. */
export const MAX_PER_PAGE = 500;

/** Shape of GET /hiv/eid/patients/by_facility/. */
export type PatientsPage = {
  status: string;
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  data: Record<string, unknown>[];
};

/** One page of up to 500 patients (spec §4.5); `total` is the full count, so callers can tell when the list is cut. */
export async function fetchPatients(
  params: Params,
  token: string | null,
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const page = await eidGet<PatientsPage>(
    "/patients/by_facility/",
    { ...params, page: 1, per_page: MAX_PER_PAGE },
    token,
  );
  return { rows: page.data ?? [], total: page.total_count ?? 0 };
}
