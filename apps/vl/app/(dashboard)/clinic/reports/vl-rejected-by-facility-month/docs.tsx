import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por mês de registo, para os locais seleccionados."
      legend={[
        { label: "Amostras Rejeitadas", color: "#ef5350", description: "Amostras com código de rejeição." },
      ]}
      reading={[
        "Uma barra por mês.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
      ]}
      notes={[
        "Período pela data de registo, ambos os dias incluídos.",
        "Rejeitada = código de rejeição LIMS ou HIVVL.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
