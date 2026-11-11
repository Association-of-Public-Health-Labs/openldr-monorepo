"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { getDashboards } from "@repo/design_system/dashboards";
import { SignInScreen } from "@repo/design_system/app/organisms/auth/SignInScreen";
import {
  completePasswordReset,
  postSignInUrl,
  requestPasswordReset,
  signInWithPassword,
  type SignInResourceLike,
} from "@repo/design_system/app/organisms/auth/sign-in-flow";

const CURRENT = "eid" as const;
const PORTALS = getDashboards().filter((d) => d.id === "vl" || d.id === "tb" || d.id === "eid");

export default function SignInClientPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.push("/");
  }, [isSignedIn, router]);

  function clerk(): SignInResourceLike {
    if (!isLoaded || !signIn) throw new Error("A autenticação ainda está a carregar. Tente de novo.");
    return signIn as unknown as SignInResourceLike;
  }

  function go(url: string) {
    if (url === "/") router.push("/");
    else window.location.assign(url);
  }

  return (
    <SignInScreen
      currentId={CURRENT}
      portals={PORTALS}
      backgroundSrc="/login-bg.jpg"
      onSignIn={async (portal, email, password) => {
        await signInWithPassword(clerk(), setActive!, email, password);
        go(postSignInUrl(portal, CURRENT));
      }}
      onRequestReset={(email) => requestPasswordReset(clerk(), email)}
      onCompleteReset={async (portal, code, password) => {
        await completePasswordReset(clerk(), setActive!, code, password);
        go(postSignInUrl(portal, CURRENT));
      }}
    />
  );
}
