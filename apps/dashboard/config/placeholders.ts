export type PlaceholderReport = {
  description: string;
  subtitle: string;
  tags: string[];
  title: string;
};

const pending = "Placeholder sem dados nesta fase";

export const placeholderReports: Record<string, PlaceholderReport[]> = {
  "/tb": [
    {
      title: "Indicadores principais de Tuberculose",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Estrutura reservada para amostras registadas, analisadas, resultados positivos, negativos e inválidos.",
      tags: ["TB", "Nacional"],
    },
    {
      title: "Resultados Ultra/XDR",
      subtitle: "Período exemplo: mês corrente",
      description: "Área preparada para distribuição futura de resultados GeneXpert Ultra e XDR.",
      tags: ["Ultra", "XDR"],
    },
    {
      title: "Positividade por Província",
      subtitle: "Período exemplo: ano corrente",
      description: "Card reservado para comparação da positividade por província.",
      tags: ["Província", "Positividade"],
    },
    {
      title: "Amostras por Tipo de Espécime",
      subtitle: pending,
      description: "Estrutura preparada para desagregação por tipo de espécime.",
      tags: ["Espécime", "Amostras"],
    },
  ],
  "/tb/lab": [
    {
      title: "Amostras Registadas por Laboratório",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Área reservada para volume de amostras registadas por laboratório.",
      tags: ["Laboratório", "Registadas"],
    },
    {
      title: "Amostras Registadas por Mês",
      subtitle: "Período exemplo: ano corrente",
      description: "Estrutura para tendência mensal de amostras registadas.",
      tags: ["Mensal", "Amostras"],
    },
    {
      title: "Amostras Rejeitadas por Laboratório",
      subtitle: pending,
      description: "Card preparado para rejeições laboratoriais por unidade de testagem.",
      tags: ["Rejeições", "Laboratório"],
    },
    {
      title: "Amostras Rejeitadas por Motivo",
      subtitle: pending,
      description: "Estrutura para motivos de rejeição e controlo de qualidade.",
      tags: ["Motivo", "Qualidade"],
    },
  ],
  "/tb/clinic": [
    {
      title: "Amostras por Província",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Card preparado para amostras registadas e testadas por província.",
      tags: ["Província", "Amostras"],
    },
    {
      title: "Amostras por Distrito",
      subtitle: pending,
      description: "Estrutura para análise operacional por distrito.",
      tags: ["Distrito", "Operação"],
    },
    {
      title: "Amostras por Unidade Sanitária",
      subtitle: pending,
      description: "Área reservada para comparação por unidade sanitária.",
      tags: ["US", "Origem"],
    },
    {
      title: "Tempo de Resposta por Local",
      subtitle: pending,
      description: "Card preparado para tempo de resposta por origem geográfica.",
      tags: ["TAT", "Local"],
    },
  ],
  "/tb/patients": [
    {
      title: "Pesquisa de Pacientes",
      subtitle: "Placeholder de tabela",
      description: "Estrutura preparada para pesquisa e revisão de resultados individuais.",
      tags: ["Pesquisa", "Pacientes"],
    },
    {
      title: "Resultados Detalhados",
      subtitle: pending,
      description: "Área reservada para listagem de resultados laboratoriais.",
      tags: ["Resultados", "Detalhe"],
    },
  ],
  "/viral-load": [
    {
      title: "Indicadores principais de Carga Viral",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Estrutura reservada para volume, supressão, rejeições e TAT nacional.",
      tags: ["CV", "Nacional"],
    },
    {
      title: "Supressão Viral por Mês",
      subtitle: "Período exemplo: ano corrente",
      description: "Card preparado para tendência mensal de supressão viral.",
      tags: ["Supressão", "Mensal"],
    },
    {
      title: "TAT por Mês",
      subtitle: pending,
      description: "Área reservada para tempo de resposta mensal.",
      tags: ["TAT", "Mensal"],
    },
    {
      title: "Histórico de Amostras",
      subtitle: pending,
      description: "Estrutura preparada para série histórica de amostras de Carga Viral.",
      tags: ["Histórico", "Amostras"],
    },
  ],
  "/viral-load/lab": [
    {
      title: "Amostras Testadas por Laboratório",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Card reservado para volume de amostras testadas por laboratório.",
      tags: ["Laboratório", "Testadas"],
    },
    {
      title: "Amostras Testadas por Mês",
      subtitle: "Período exemplo: ano corrente",
      description: "Estrutura para tendência mensal de testagem.",
      tags: ["Mensal", "Testadas"],
    },
    {
      title: "Rejeições por Laboratório",
      subtitle: pending,
      description: "Área reservada para rejeições laboratoriais de Carga Viral.",
      tags: ["Rejeições", "Laboratório"],
    },
    {
      title: "TAT por Laboratório",
      subtitle: pending,
      description: "Card preparado para tempo de resposta por laboratório.",
      tags: ["TAT", "Laboratório"],
    },
  ],
  "/viral-load/clinic": [
    {
      title: "Amostras por Província",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Estrutura para volume por província.",
      tags: ["Província", "Amostras"],
    },
    {
      title: "Amostras por Distrito",
      subtitle: pending,
      description: "Área preparada para análise distrital.",
      tags: ["Distrito", "Amostras"],
    },
    {
      title: "Amostras por Unidade Sanitária",
      subtitle: pending,
      description: "Card reservado para origem das amostras por unidade sanitária.",
      tags: ["US", "Origem"],
    },
    {
      title: "Rejeições por Unidade",
      subtitle: pending,
      description: "Estrutura para rejeições por unidade sanitária.",
      tags: ["Rejeições", "US"],
    },
  ],
  "/viral-load/patients": [
    {
      title: "Pesquisa de Pacientes",
      subtitle: "Placeholder de tabela",
      description: "Estrutura preparada para pesquisa de resultados individuais de Carga Viral.",
      tags: ["Pesquisa", "Pacientes"],
    },
    {
      title: "Histórico de Resultados",
      subtitle: pending,
      description: "Área reservada para histórico individual de resultados laboratoriais.",
      tags: ["Histórico", "Resultados"],
    },
  ],
  "/dpi": [
    {
      title: "Indicadores principais de DPI",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Estrutura reservada para PCR, POC, positividade e TAT.",
      tags: ["DPI", "Nacional"],
    },
    {
      title: "Positividade por Mês",
      subtitle: "Período exemplo: ano corrente",
      description: "Card preparado para tendência mensal de positividade.",
      tags: ["Positividade", "Mensal"],
    },
    {
      title: "Amostras por Equipamento",
      subtitle: pending,
      description: "Área reservada para distribuição por equipamento e plataforma.",
      tags: ["Equipamento", "Amostras"],
    },
    {
      title: "TAT Convencional/POC",
      subtitle: pending,
      description: "Estrutura preparada para comparação de tempo de resposta convencional e POC.",
      tags: ["TAT", "POC"],
    },
  ],
  "/dpi/lab": [
    {
      title: "Amostras Testadas",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Card reservado para amostras testadas por laboratório.",
      tags: ["Laboratório", "Testadas"],
    },
    {
      title: "TAT Laboratorial",
      subtitle: pending,
      description: "Estrutura para tempo de resposta laboratorial de DPI.",
      tags: ["TAT", "Laboratório"],
    },
    {
      title: "Amostras por Equipamento",
      subtitle: pending,
      description: "Área reservada para volume por equipamento.",
      tags: ["Equipamento", "Mensal"],
    },
  ],
  "/dpi/clinic": [
    {
      title: "Amostras por Província",
      subtitle: "Período exemplo: últimos 12 meses",
      description: "Card preparado para amostras por província.",
      tags: ["Província", "Amostras"],
    },
    {
      title: "Amostras por Distrito",
      subtitle: pending,
      description: "Estrutura reservada para análise distrital de DPI.",
      tags: ["Distrito", "DPI"],
    },
    {
      title: "Amostras por Unidade Sanitária",
      subtitle: pending,
      description: "Área preparada para origem das amostras por unidade sanitária.",
      tags: ["US", "Origem"],
    },
    {
      title: "Tempo de Resposta por Local",
      subtitle: pending,
      description: "Card preparado para TAT por local de origem.",
      tags: ["TAT", "Local"],
    },
  ],
  "/dpi/routes": [
    {
      title: "Rotas de Amostras",
      subtitle: "Placeholder geográfico",
      description: "Estrutura reservada para visualização das rotas de amostras.",
      tags: ["Rotas", "Mapa"],
    },
    {
      title: "Fluxo de Transporte",
      subtitle: pending,
      description: "Card preparado para origem, destino e etapas de transporte.",
      tags: ["Transporte", "Fluxo"],
    },
    {
      title: "Laboratórios de Origem/Destino",
      subtitle: pending,
      description: "Área reservada para comparação entre laboratórios de origem e destino.",
      tags: ["Laboratório", "Destino"],
    },
    {
      title: "Volume por Rota",
      subtitle: pending,
      description: "Estrutura preparada para volume de amostras por rota.",
      tags: ["Volume", "Rota"],
    },
  ],
};

export function getPlaceholderReports(pathname: string) {
  return placeholderReports[pathname] ?? [];
}
