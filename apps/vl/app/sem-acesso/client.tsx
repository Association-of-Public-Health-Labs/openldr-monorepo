"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { parseAccess } from "@repo/design_system/lib/access";
import { NoAccess } from "@repo/design_system/app/organisms/report/no-access";

export default function NoAccessClient() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  if (!isLoaded) return null;
  return (
    <NoAccess
      dashboard="vl"
      access={parseAccess(user?.publicMetadata)}
      onSignOut={isSignedIn ? () => signOut({ redirectUrl: "/sign-in" }) : undefined}
    />
  );
}
