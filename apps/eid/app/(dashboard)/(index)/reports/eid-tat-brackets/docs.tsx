import { CardDocs } from "@/components/card-docs";
import { TAT_BRACKETS, TAT_SEGMENTS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

const DESCRIPTIONS = [
  "Amostras em que a etapa demorou menos de 7 dias.",
  "Amostras em que a etapa demorou entre 7 e 15 dias.",
  "Amostras em que a etapa demorou entre 16 e 21 dias.",
  "Amostras em que a etapa demorou mais de 21 dias.",
  "Amostras em que falta uma das duas datas da etapa.",
];

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras de diagnóstico precoce infantil (EID) por intervalo de dias de uma etapa do circuito, por mês de análise. O título mostra a etapa escolhida (TRL - etapa)."
      legend={TAT_BRACKETS.map((b, i) => ({ label: b.label, color: b.color, description: DESCRIPTIONS[i] }))}
      reading={[
        `Cada barra empilha as amostras do mês por intervalo de dias: <7, 7-15, 16-21, >21 e Sem datas (limites inclusivos).`,
        "Sem datas: amostras em que falta a data de início ou de fim da etapa escolhida.",
        `As seis etapas, pela cadeia de datas colheita, recepção no Hub, registo no Hub, recepção no laboratório, registo no laboratório, análise, validação: ${TAT_SEGMENTS.map((s) => s.label).join("; ")}.`,
        "Os meses são os da data de análise da amostra.",
      ]}
      filters={[
        "Editar período: intervalo de datas, aplicado à data de análise (por omissão, últimos 12 meses).",
        "Segmento: escolhe a etapa (por omissão, a primeira: Colheita na US a Recepção no Hub). Reiniciar o relatório volta a esta etapa.",
      ]}
      notes={[
        "Só entram amostras convencionais (não PoC).",
        "Só entram amostras com data de recepção no laboratório igual ou posterior à de colheita.",
        "As datas do Hub têm de ser anteriores às do laboratório e o registo no Hub anterior à recepção no laboratório. Ao contrário do cartão de tempo médio, não se exige a recepção no Hub anterior ao registo no laboratório.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
