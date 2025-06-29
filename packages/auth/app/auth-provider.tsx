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
    >
      {children as any}
    </ClerkProvider>
  );
}