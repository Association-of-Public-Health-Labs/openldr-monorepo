
import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { AuthProvider } from "@repo/auth";
import { ThemeProvider } from "../context/theme-provider"

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
  // const { theme, setTheme } = useTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${openSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
