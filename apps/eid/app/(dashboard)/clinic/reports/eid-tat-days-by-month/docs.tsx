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
      overview="Número de amostras convencionais de diagnóstico precoce infantil (EID) por intervalo de dias de uma etapa do circuito, por mês."
      legend={TAT_BRACKETS.map((s, i) => ({ label: s.label, color: s.color, description: DESCRIPTIONS[i] }))}
      reading={[
        "Data de referência: data de análise. Cada barra empilha o número de amostras por intervalo de dias da etapa escolhida: <7, 7-15, 16-21, >21 e Sem datas (limites inclusivos).",
        "Sem datas: amostras em que falta a data de início ou de fim da etapa escolhida.",
        "Este cartão não tem descida de nível.",
        `As seis etapas: ${TAT_SEGMENTS.map((s) => s.label).join("; ")}.`,
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Segmento: escolhe a etapa (por omissão, a primeira: Colheita na US a Recepção no Hub). O título indica a etapa. Reiniciar o relatório volta a esta etapa."
      ]}
      notes={[
        "Só entram amostras convencionais (IsPoc = No), sem filtro de tipo de laboratório. Datas: as do Hub têm de ser anteriores às do laboratório; o laboratório não pode ser PBC; o registo à análise demora no máximo 30 dias.",
        "Ao contrário do cartão de tempo médio, não se exige que o registo no Hub à recepção no laboratório e a colheita ao registo no Hub sejam não negativos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
