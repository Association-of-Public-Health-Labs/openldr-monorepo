"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider";
import TbPatientsPage from "../../../../tb/app/(dashboard)/patients/page";

type TuberculosisPatientsRuntimeProps = {
  publishableKey: string;
};

export function TuberculosisPatientsRuntime({ publishableKey }: TuberculosisPatientsRuntimeProps) {
  return (
    <ClerkProvider
      afterSignInUrl="/tb/patients"
      afterSignUpUrl="/tb/patients"
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <AIChatProvider dashboard="tb" panelSizes={{ left: 75, right: 25 }} onPanelResize={() => undefined}>
        <TbPatientsPage />
      </AIChatProvider>
    </ClerkProvider>
  );
}
