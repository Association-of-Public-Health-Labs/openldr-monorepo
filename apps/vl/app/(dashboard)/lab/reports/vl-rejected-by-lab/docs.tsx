import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por laboratório, identificado pelo código no número da requisição."
      reading={[
        "Uma barra por laboratório.",
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
