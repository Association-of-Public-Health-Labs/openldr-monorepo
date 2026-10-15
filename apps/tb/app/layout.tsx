
import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { AuthProvider } from "@repo/auth";
import { PlatformThemeProvider } from "@repo/design_system/theme/PlatformThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal de TB",
  description: "Portal de Tuberculose",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" data-dashboard="tb" suppressHydrationWarning>
      <body
        className={` ${openSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <PlatformThemeProvider dashboard="tb">
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
            {children}
          </ClerkProvider>
          {/* <AuthProvider>
            {children}
          </AuthProvider> */}
        </PlatformThemeProvider>
      </body>
    </html>
  );
}
