import { Suspense } from "react";
import AcceptInviteClient from "./client";

export default function AcceptInvitePage() {
  // useSearchParams needs a Suspense boundary for the static build.
  return (
    <Suspense fallback={null}>
      <AcceptInviteClient />
    </Suspense>
  );
}
