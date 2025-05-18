import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import { AuthProvider } from "@repo/auth-v2";
import { AppProvider } from "@repo/design_system";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body
        className={` ${openSans.variable} antialiased`}
      >
        <AppProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
