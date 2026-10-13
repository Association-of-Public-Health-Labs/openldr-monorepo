import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio de cada etapa do circuito da amostra, por mês, para os locais seleccionados."
      reading={[
        "Quatro etapas empilhadas por mês.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimos 12 meses).",
        "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
      ]}
      notes={[
        "✱ Sem limite de 90 dias.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
