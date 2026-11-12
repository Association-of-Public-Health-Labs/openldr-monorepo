import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/design_system/components/ui/button";
import { EMBLEM_URL } from "@repo/design_system/layout/shell-utils";
import { DemoPlayer } from "../../components/demo-player";
import { ModeToggle } from "../../components/mode-toggle";

export const metadata: Metadata = {
  title: "Vídeo de demonstração · OpenLDR",
  description: "Como encontrar os portais do OpenLDR, entrar e explorar os relatórios de Carga Viral, DPI e Tuberculose.",
};

// The video is served by this app (public/demo), in HD and a light 720p version. The captions are part of the image.
const MUTED = "text-[#637381] dark:text-[#919EAB]";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#1C252E] dark:bg-[#141a21] dark:text-white">
      <header className="sticky top-0 z-20 border-b border-[rgba(145,158,171,0.16)] bg-white/80 backdrop-blur-md dark:bg-[#141a21]/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <img src={EMBLEM_URL} alt="" className="size-9 object-contain" />
          <div className="leading-tight">
            <p className="text-sm font-bold">OpenLDR</p>
            <p className={`text-xs ${MUTED}`}>Ministério da Saúde</p>
          </div>
          <nav className="ml-auto flex items-center gap-1">
            <Button asChild variant="ghost">
              <Link href="/">
                <ArrowLeft />
                Página inicial
              </Link>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <h1 className="text-2xl font-bold sm:text-3xl">Vídeo de demonstração</h1>
        <p className={`mt-2 max-w-3xl text-sm leading-6 ${MUTED}`}>
          Como encontrar os portais, entrar e explorar os relatórios: navegação, configurações, filtros e as opções de
          cada relatório, nos portais de Carga Viral, DPI e Tuberculose. Duração: 8 minutos.
        </p>
        <div className="mt-6">
          <DemoPlayer />
        </div>
      </main>
    </div>
  );
}
