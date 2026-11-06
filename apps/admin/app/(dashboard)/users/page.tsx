import { Suspense } from "react";
import { NOT_ENFORCED_NOTICE, permissionsEnforced } from "@/lib/admin/enforcement";
import UsersTable from "./reports/users-table";

export default function UsersPage() {
  return (
    <div className="w-full space-y-4">
      {!permissionsEnforced(process.env.NEXT_PUBLIC_PERMISSIONS_ENFORCED) && (
        <p role="note" className="rounded-md bg-[rgba(255,171,0,0.16)] p-3 text-sm font-medium text-[#8A5A00] dark:text-[#FFD666]">
          {NOT_ENFORCED_NOTICE}
        </p>
      )}
      {/* The table reads ?user= from the URL, which needs a Suspense boundary. */}
      <Suspense>
        <UsersTable />
      </Suspense>
    </div>
  );
}
