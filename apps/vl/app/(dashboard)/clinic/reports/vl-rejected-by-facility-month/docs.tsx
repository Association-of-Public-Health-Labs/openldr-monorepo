import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por mês de registo, para os locais seleccionados."
      reading={[
        "Uma barra por mês.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimos 12 meses).",
        "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
      ]}
      notes={[
        "Janela pela data de registo, ambos os dias incluídos.",
        "✱ Rejeitada = código de rejeição LIMS ou HIVVL.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
