import Image from "next/image";
import { ArrowDown, BarChart3, Database, KeyRound, PlayCircle, Workflow } from "lucide-react";
import { Button } from "@repo/design_system/components/ui/button";
import { getDashboards } from "@repo/design_system/dashboards";
import { EMBLEM_URL } from "@repo/design_system/layout/shell-utils";
import { DashboardCard } from "../components/dashboard-card";
import { ModeToggle } from "../components/mode-toggle";
import { buildCatalog } from "../lib/catalog";

/** Link to the demo video; set at build time. Until it is set, the button shows "em breve". */
const DEMO_VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;

const STEPS = [
  {
    icon: Database,
    title: "Recolha",
    text: "Os sistemas de informação laboratorial (LIMS) enviam os resultados das amostras para o repositório central.",
  },
  {
    icon: Workflow,
    title: "Integração",
    text: "O OpenLDR normaliza os dados e liga-os ao dicionário nacional de laboratórios e unidades sanitárias.",
  },
  {
    icon: BarChart3,
    title: "Análise",
    text: "Os portais apresentam os indicadores por província, distrito, laboratório e unidade sanitária.",
  },
];

const MUTED = "text-[#637381] dark:text-[#919EAB]";

export default function HomePage() {
  const catalog = buildCatalog(getDashboards());
  const live = catalog.filter((e) => e.available);

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
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <a href="#portais">Portais</a>
            </Button>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <a href="#como-funciona">Como funciona</a>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#919EAB] uppercase">República de Moçambique · Ministério da Saúde</p>
            <h1 className="mt-4 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl xl:text-[2.75rem]">
              Portais de Análise de Dados do Sistema Nacional de Informação Laboratorial
            </h1>
            <p className={`mt-5 max-w-xl text-base leading-7 ${MUTED}`}>
              O OpenLDR, Repositório de Dados Laboratoriais, reúne os resultados dos laboratórios do país num só lugar e
              apresenta-os em portais de análise por programa de saúde.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#portais">
                  Explorar os portais
                  <ArrowDown />
                </a>
              </Button>
              {DEMO_VIDEO_URL ? (
                <Button asChild size="lg" variant="outline">
                  <a href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">
                    <PlayCircle />
                    Ver o vídeo de demonstração
                  </a>
                </Button>
              ) : (
                <Button size="lg" variant="outline" disabled>
                  <PlayCircle />
                  Vídeo de demonstração (em breve)
                </Button>
              )}
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className={`text-xs ${MUTED}`}>Portais disponíveis</dt>
                <dd className="text-2xl font-bold">{live.length}</dd>
              </div>
              <div>
                <dt className={`text-xs ${MUTED}`}>Programas</dt>
                <dd className="text-2xl font-bold">HIV · Tuberculose</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src="/hero.jpg" alt="" fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 flex max-w-[280px] items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_24px_-4px_rgba(145,158,171,0.24)] sm:-left-6 dark:bg-[#1d232a] dark:shadow-none dark:ring-1 dark:ring-[rgba(145,158,171,0.16)]">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1C252E] text-white dark:bg-white dark:text-[#1C252E]">
                <KeyRound className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Um só acesso</p>
                <p className={`text-xs leading-5 ${MUTED}`}>Entre uma vez e navegue entre todos os portais.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="portais" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold">Portais</h2>
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${MUTED}`}>
            Escolha um portal para analisar os dados do seu programa. O acesso aos portais requer uma conta OpenLDR.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {catalog.map((entry) => (
              <DashboardCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold">Como funciona</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-dashed border-[rgba(145,158,171,0.32)] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[rgba(145,158,171,0.12)]">
                    <step.icon className="size-5" />
                  </span>
                  <span className={`text-xs font-bold ${MUTED}`}>0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-bold">{step.title}</h3>
                <p className={`mt-1 text-sm leading-6 ${MUTED}`}>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-[rgba(145,158,171,0.16)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <img src={EMBLEM_URL} alt="" className="size-10 object-contain" />
            <div className="text-sm leading-6">
              <p className="font-bold">OpenLDR · Repositório de Dados Laboratoriais</p>
              <p className={MUTED}>Ministério da Saúde · República de Moçambique</p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {live.map((e) => (
              <li key={e.id}>
                <a href={e.href} className={`hover:underline ${MUTED}`}>
                  {e.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className={`pb-8 text-center text-xs ${MUTED}`}>© {new Date().getFullYear()} OpenLDR</p>
      </footer>
    </div>
  );
}
