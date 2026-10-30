import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por laboratório, identificado pelo código no número da requisição."
      legend={[
        { label: "Amostras Rejeitadas", color: "#ef5350", description: "Amostras com código de rejeição." },
      ]}
      reading={[
        "Uma barra por laboratório.",
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
