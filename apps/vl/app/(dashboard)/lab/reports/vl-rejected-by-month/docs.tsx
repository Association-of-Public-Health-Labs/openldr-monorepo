import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por mês de registo."
      reading={[
        "Uma barra por mês.",
      ]}
      filters={[
        "Intervalo de datas (data de registo, ambos os dias incluídos).",
        "Laboratórios.",
      ]}
      endpoint={ENDPOINT}
      notes={[
        "Rejeitada = tem código de rejeição LIMS ou HIVVL.",
      ]}
    />
  );
}
