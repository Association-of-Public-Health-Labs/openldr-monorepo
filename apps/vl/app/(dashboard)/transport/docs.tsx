import { CardDocs } from "@/components/card-docs";
import { TAT_CLASSES, TAT_NO_DATA, TARGET, TARGET_DAYS } from "@/lib/vl/transport/tat";

const DESCRIPTIONS = [
  "A maioria das amostras chegou ao laboratório em menos de 7 dias.",
  "A maioria chegou entre 7 e 15 dias.",
  "A maioria chegou entre 16 e 21 dias: fora do alvo.",
  "A maioria levou mais de 21 dias: fora do alvo.",
];

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo de transporte das amostras de carga viral, da colheita à recepção no laboratório, por província, distrito e unidade sanitária, semana a semana."
      legend={[
        ...TAT_CLASSES.map((c, i) => ({ label: c.label, color: c.color, description: DESCRIPTIONS[i] })),
        { label: TAT_NO_DATA.label, color: TAT_NO_DATA.color, description: "Sem amostras no período." },
      ]}
      reading={[
        "A cor de cada área é o intervalo em que caiu a maioria das suas amostras (num empate, o pior).",
        `% transportadas <${TARGET_DAYS} dias: amostras com menos de 7 dias e de 7 a 15 dias, sobre o total. O alvo é ${Math.round(TARGET * 100)}%.`,
        "Fora do alvo: áreas cuja maioria das amostras levou mais de 15 dias.",
        "Só contam amostras com data de colheita. As que ainda não têm data de recepção no laboratório são contadas à parte (Sem data de recepção).",
        "Os números são os da folha «Tempo de Transporte» do relatório semanal de CV (Colheita à Recepção no Lab), por semana de domingo a sábado.",
      ]}
      filters={[
        "Período: uma semana (domingo a sábado, como nos relatórios semanais de CV) ou um intervalo de semanas.",
        "Clique numa província para ver os distritos e num distrito para ver as unidades sanitárias. O caminho no topo do mapa leva de volta.",
        "Na tabela, ordene clicando no título de uma coluna (por omissão, pior desempenho primeiro).",
      ]}
      notes={[
        "Fonte: ReportData.VLTransportTATPerWeek, actualizada várias vezes por dia. A semana corrente aparece quando termina.",
        "Cada unidade sanitária, laboratório, tipo de teste e semana conta uma vez: cópias repetidas da mesma linha na tabela são ignoradas.",
      ]}
      endpoint="/hiv/vl/transport/tat_by_location/ e /hiv/vl/transport/tat_by_week/"
    />
  );
}
