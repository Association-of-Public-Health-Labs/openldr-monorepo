import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Evolução do tempo de resposta laboratorial (TRL) face ao número de impressoras Disa*Link instaladas, por semestre."
      reading={[
        "Linha verde: TRL médio em dias (eixo esquerdo).",
        "Linha laranja: número de Disalinks (eixo direito).",
      ]}
      filters={["Sem filtros: dados históricos fixos (2017–2020), herdados do portal anterior."]}
      endpoint={ENDPOINT}
    />
  );
}
