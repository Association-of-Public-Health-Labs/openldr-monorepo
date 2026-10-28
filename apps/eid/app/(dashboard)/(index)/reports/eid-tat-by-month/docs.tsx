import { CardDocs } from "@/components/card-docs";
import { TAT_SEGMENTS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

const DESCRIPTIONS = [
  "Dias médios entre a colheita e a recepção no Hub.",
  "Dias médios entre a recepção e o registo no Hub.",
  "Dias médios entre o registo no Hub e a recepção no laboratório.",
  "Dias médios entre a recepção e o registo no laboratório.",
  "Dias médios entre o registo e a análise.",
  "Dias médios entre a análise e a validação.",
];

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio, em dias, de cada etapa do circuito da amostra de diagnóstico precoce infantil (EID), por mês de análise."
      legend={TAT_SEGMENTS.map((s, i) => ({ label: s.label, color: s.color, description: DESCRIPTIONS[i] }))}
      reading={[
        "Cada barra empilha as seis etapas; a altura total é a soma das médias das etapas.",
        "As datas seguem a cadeia: colheita, recepção no Hub, registo no Hub, recepção no laboratório, registo no laboratório, análise e validação.",
        "As médias são números inteiros (os dias são truncados) e as amostras sem datas numa etapa ficam fora da média dessa etapa. Um mês só mostra 0 numa etapa quando nenhuma das suas amostras tem as datas dessa etapa.",
        "Os meses são os da data de análise da amostra.",
      ]}
      filters={["Editar período: intervalo de datas, aplicado à data de análise (por omissão, últimos 12 meses)."]}
      notes={[
        "Só entram amostras convencionais (não PoC).",
        "Só entram amostras com data de recepção no laboratório igual ou posterior à de colheita.",
        "As datas do Hub têm de ser anteriores às do laboratório, o registo no Hub anterior à recepção no laboratório e a recepção no Hub anterior ao registo no laboratório.",
        "Sem limite de dias e sem exclusão de laboratórios.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
