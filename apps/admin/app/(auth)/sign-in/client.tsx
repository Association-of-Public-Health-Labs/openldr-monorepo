"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { getDashboard } from "@repo/design_system/dashboards";
import { SignInScreen } from "@repo/design_system/app/organisms/auth/SignInScreen";
import {
  completePasswordReset,
  type SignInResourceLike,
} from "@repo/design_system/app/organisms/auth/sign-in-flow";
import { GENERIC_SIGN_IN_ERROR, signInErrorMessage } from "@/lib/admin/sign-in-errors";

// Admin only: no portal selector, and sign-in stays on this app.
const PORTALS = [getDashboard("admin")];

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

  return (
    <SignInScreen
      currentId="admin"
      portals={PORTALS}
      title="Portal de Administração"
      backgroundSrc="/login-bg.jpg"
      onSignIn={async (_portal, email, password) => {
        // Admin keeps its own error wording: one message for unknown user and wrong password.
        try {
          const result = await clerk().create({ identifier: email.trim(), password });
          if (result.status !== "complete") throw new Error(GENERIC_SIGN_IN_ERROR);
          await setActive!({ session: result.createdSessionId });
        } catch (err) {
          if (err instanceof Error && !("errors" in err)) throw err;
          const message = signInErrorMessage(err);
          if (message !== null) throw new Error(message);
        }
        router.push("/");
      }}
      onRequestReset={async (email) => {
        // Don't reveal whether the email has an account.
        try {
          await clerk().create({ strategy: "reset_password_email_code", identifier: email.trim() });
        } catch (err) {
          if (err instanceof Error && !("errors" in err)) throw err;
          const code = (err as { errors?: { code?: string }[] }).errors?.[0]?.code;
          if (code !== "form_identifier_not_found") throw new Error(signInErrorMessage(err) ?? GENERIC_SIGN_IN_ERROR);
        }
      }}
      onCompleteReset={async (_portal, code, password) => {
        await completePasswordReset(clerk(), setActive!, code, password);
        router.push("/");
      }}
    />
  );
}
