"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider";
import TbClinicPage from "../../../../tb/app/(dashboard)/clinic/page";

type TuberculosisClinicRuntimeProps = {
  publishableKey: string;
};

export function TuberculosisClinicRuntime({ publishableKey }: TuberculosisClinicRuntimeProps) {
  return (
    <ClerkProvider
      afterSignInUrl="/tb/clinic"
      afterSignUpUrl="/tb/clinic"
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <AIChatProvider dashboard="tb" panelSizes={{ left: 75, right: 25 }} onPanelResize={() => undefined}>
        <TbClinicPage />
      </AIChatProvider>
    </ClerkProvider>
  );
}
