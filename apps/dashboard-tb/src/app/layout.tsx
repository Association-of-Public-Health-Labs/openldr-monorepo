import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { AppProvider } from "@repo/design_system";
import { AuthProvider } from "@repo/auth";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard de TB",
  description: "Dashboard de TB",
}; 

export default function RootLayout({
  children,  
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${openSans.variable} antialiased`}
      >
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
