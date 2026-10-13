import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio, em dias, de cada etapa do circuito da amostra a nível nacional, por mês de análise."
      reading={[
        "Cada barra empilha quatro etapas: Colheita à Recepção, Recepção ao Registo, Registo à Análise e Análise à Validação.",
        "A altura total é a soma das médias das etapas.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
      notes={[
        "Só entram amostras com resultado e com data de recepção igual ou posterior à de colheita.",
        "✱ Sem limite de 90 dias: o sistema anterior pretendia aplicá-lo, mas nunca o aplicou.",
      ]}
    />
  );
}
