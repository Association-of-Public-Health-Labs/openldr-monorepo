import { Suspense } from "react";
import UsersTable from "./reports/users-table";

export default function UsersPage() {
  return (
    <div className="w-full">
      {/* The table reads ?user= from the URL, which needs a Suspense boundary. */}
      <Suspense>
        <UsersTable />
      </Suspense>
    </div>
  );
}
