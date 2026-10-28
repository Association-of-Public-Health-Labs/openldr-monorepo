import { CardDocs } from "@/components/card-docs";
import { TAT_SEGMENTS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

const DESCRIPTIONS = [
  "Dias entre a colheita na unidade sanitária e a recepção no Hub.",
  "Dias entre a recepção e o registo no Hub.",
  "Dias entre o registo no Hub e a recepção no laboratório.",
  "Dias entre a recepção e o registo no laboratório.",
  "Dias entre o registo no laboratório e a análise.",
  "Dias entre a análise e a validação.",
];

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio de resposta, em dias, de cada etapa do circuito das amostras convencionais de diagnóstico precoce infantil (EID), por mês."
      legend={TAT_SEGMENTS.map((s, i) => ({ label: s.label, color: s.color, description: DESCRIPTIONS[i] }))}
      reading={[
        "Data de referência: data de análise. Cada barra empilha o tempo médio, em dias, de cada uma das seis etapas do circuito, pela ordem da cadeia de datas.",
        "Este cartão não tem descida de nível."
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses)."
      ]}
      notes={[
        "Só entram amostras convencionais (IsPoc = No): os cartões de tempo de resposta não têm filtro de tipo de laboratório e não incluem amostras PoC.",
        "Datas: as do Hub têm de ser anteriores às do laboratório; o laboratório não pode ser PBC; o registo à análise demora no máximo 30 dias; o registo no Hub à recepção no laboratório e a colheita ao registo no Hub não podem ser negativos.",
        "Médias iguais a 0 dias são apresentadas como 1.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
