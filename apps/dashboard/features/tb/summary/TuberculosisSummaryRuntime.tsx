"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider";
import TbSummaryPage from "../../../../tb/app/(dashboard)/(index)/page";

type TuberculosisSummaryRuntimeProps = {
  publishableKey: string;
};

export function TuberculosisSummaryRuntime({ publishableKey }: TuberculosisSummaryRuntimeProps) {
  return (
    <ClerkProvider
      afterSignInUrl="/tb"
      afterSignUpUrl="/tb"
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <AIChatProvider dashboard="tb" panelSizes={{ left: 75, right: 25 }} onPanelResize={() => undefined}>
        <TbSummaryPage />
      </AIChatProvider>
    </ClerkProvider>
  );
}
