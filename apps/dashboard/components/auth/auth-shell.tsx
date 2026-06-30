import { Logo } from "@repo/design_system/app/atoms/images/Logo";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function AuthShell({ children, subtitle, title }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#141a21] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,176,0,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(248,162,0,0.18),transparent_30%),linear-gradient(135deg,#141a21_0%,#1d232a_55%,#f4f4f4_55%,#ffffff_100%)]" />
      <section className="relative z-10 flex min-h-screen items-center justify-end px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 px-5 py-8 shadow-2xl backdrop-blur md:px-8">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <Logo width={72} />
            <p className="text-sm font-bold text-[#222]">República de Moçambique</p>
            <p className="text-sm font-bold text-[#222]">Ministério da Saúde</p>
            <h1 className="mt-2 text-2xl font-extrabold text-[#00B000]">{title}</h1>
            <p className="text-sm font-semibold text-[#8996a0]">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
