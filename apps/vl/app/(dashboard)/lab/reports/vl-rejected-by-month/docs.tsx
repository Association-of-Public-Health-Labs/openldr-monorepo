import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por mês de registo."
      legend={[
        { label: "Amostras Rejeitadas", color: "#fb8c00", description: "Amostras com código de rejeição." },
      ]}
      reading={[
        "Uma barra por mês.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: grupos de laboratórios (sem selecção, ver nota).",
      ]}
      notes={[
        "Período pela data de registo, ambos os dias incluídos.",
        "Rejeitada = código de rejeição LIMS ou HIVVL.",
        "Sem selecção de laboratórios: todos os laboratórios.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
