import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard Unificada OpenLDR",
  description: "Dashboard unificada para Tuberculose, Carga Viral e DPI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${openSans.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
