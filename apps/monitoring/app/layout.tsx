
import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { PlatformThemeProvider } from "@repo/design_system/theme/PlatformThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitoria de Conectividade",
  description: "Monitoria da conectividade à internet dos sites do SIS-LAB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt" data-dashboard="monitoring" suppressHydrationWarning>
      <body
        className={` ${openSans.variable} antialiased`}
        suppressHydrationWarning
      >
        <PlatformThemeProvider dashboard="monitoring">
          <ClerkProvider 
            signInUrl="/sign-in"
            afterSignInUrl="/"
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
        </PlatformThemeProvider>
      </body>
    </html>
  );
}
