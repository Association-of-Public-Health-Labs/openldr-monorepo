"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

export function AuthProvider({
  children,
}: {
  children: any;
}) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}