import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio, em dias, de cada etapa do circuito da amostra a nível nacional, por mês de análise."
      legend={[
        { label: "Colheita à Recepção", color: "#fb8c00", description: "Dias médios entre a colheita e a recepção." },
        { label: "Recepção ao Registo", color: "#ef5350", description: "Dias médios entre a recepção e o registo." },
        { label: "Registo à Análise", color: "#6B53C6", description: "Dias médios entre o registo e a análise." },
        { label: "Análise à Validação", color: "#00b000", description: "Dias médios entre a análise e a validação." },
      ]}
      reading={[
        "Cada barra empilha quatro etapas; a altura total é a soma das médias das etapas.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
      ]}
      notes={[
        "Só entram amostras com resultado e com data de recepção igual ou posterior à de colheita.",
        "Sem limite de 90 dias: o sistema anterior pretendia aplicá-lo, mas nunca o aplicou.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
