import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenLDR · Repositório de Dados Laboratoriais",
  description: "Painéis de dados laboratoriais de Moçambique: carga viral, tuberculose e diagnóstico precoce infantil.",
};

// Before paint, so a user who chose dark mode on a dashboard never sees a light flash here. Reads the
// settings cookie the dashboards share on openldr.org.mz (see design_system layout/sharedStorage).
const THEME_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )layout-settings=([^;]*)/);var r=m?decodeURIComponent(m[1]):localStorage.getItem("layout-settings");if(r&&JSON.parse(r).state.settings.mode==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${openSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
