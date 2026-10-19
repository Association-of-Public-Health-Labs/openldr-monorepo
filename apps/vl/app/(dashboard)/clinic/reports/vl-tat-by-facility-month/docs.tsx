import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio de cada etapa do circuito da amostra, por mês, para os locais seleccionados."
      legend={[
        { label: "Colheita à Recepção", color: "#fb8c00", description: "Dias médios entre a colheita e a recepção." },
        { label: "Recepção ao Registo", color: "#ef5350", description: "Dias médios entre a recepção e o registo." },
        { label: "Registo à Análise", color: "#6B53C6", description: "Dias médios entre o registo e a análise." },
        { label: "Análise à Validação", color: "#00b000", description: "Dias médios entre a análise e a validação." },
      ]}
      reading={[
        "Quatro etapas empilhadas por mês; a altura total é a soma das médias, em dias.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
      ]}
      notes={[
        "Sem limite de 90 dias.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
