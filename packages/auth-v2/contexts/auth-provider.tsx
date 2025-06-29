// "use client";

// import { ClerkProvider } from "@clerk/nextjs";
// import React from "react";

// export function AuthProvider({
//   children,
// }: {
//   children: any;
// }) {
//   return (
//     <ClerkProvider 
//       signInUrl="/sign-in"
//       signUpUrl="/sign-up"
//     >
//       {children}
//     </ClerkProvider>
//   );
// }

"use client";

import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

export function AuthProvider({
  children,
}: {
  children: any;
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
    >
      {children}
    </ClerkProvider>
  );
}