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
        "Amostras sem data de colheita não entram nos intervalos; são contadas à parte.",
      ]}
      filters={[
        "Período: uma semana (segunda a domingo) ou um intervalo de semanas.",
        "Clique numa província para ver os distritos e num distrito para ver as unidades sanitárias. O caminho no topo do mapa leva de volta.",
        "Na tabela, ordene clicando no título de uma coluna (por omissão, pior desempenho primeiro).",
      ]}
      notes={["Dados de demonstração: os números são fictícios até a API devolver os dados de transporte."]}
      endpoint="(a definir)"
    />
  );
}
