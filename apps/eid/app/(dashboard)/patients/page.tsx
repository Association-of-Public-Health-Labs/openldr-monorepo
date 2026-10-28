import EidPatientsSearch from "./reports/eid-patients-search";

/** Admin-only patient search (the nav hides it from non-admins; the card gates it too). */
export default function Page() {
  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6">
        <EidPatientsSearch />
      </div>
    </div>
  );
}
