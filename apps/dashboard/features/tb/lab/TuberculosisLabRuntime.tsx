"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider";
import TbLabPage from "../../../../tb/app/(dashboard)/lab/page";

type TuberculosisLabRuntimeProps = {
  publishableKey: string;
};

export function TuberculosisLabRuntime({ publishableKey }: TuberculosisLabRuntimeProps) {
  return (
    <ClerkProvider
      afterSignInUrl="/tb/lab"
      afterSignUpUrl="/tb/lab"
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <AIChatProvider dashboard="tb" panelSizes={{ left: 75, right: 25 }} onPanelResize={() => undefined}>
        <TbLabPage />
      </AIChatProvider>
    </ClerkProvider>
  );
}
