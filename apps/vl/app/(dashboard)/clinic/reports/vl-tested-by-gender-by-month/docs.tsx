import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês e sexo, separadas por resultado."
      reading={[
        "Coluna verde: homens. Coluna vermelha: mulheres. A parte clara indica CV > 1000.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimos 12 meses).",
        "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
      ]}
      notes={[
        "Inclui amostras sem província requisitante quando não há filtro de local.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
