"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
        }
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {/* @ts-ignore */}
      {children}
    </ClerkProvider>
  );
}