import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Evolução do tempo de resposta laboratorial (TRL) face ao número de impressoras Disa*Link instaladas, por semestre."
      legend={[
        { label: "TAT", color: "#00b000", description: "TRL médio, em dias (eixo esquerdo)." },
        { label: "#Disalinks", color: "#f8a200", description: "Número de Disalinks (eixo direito)." },
      ]}
      reading={[
        "Duas linhas por semestre: TRL médio em dias (eixo esquerdo) e número de Disalinks (eixo direito).",
      ]}
      filters={[
        "Sem filtros: dados históricos fixos (2017–2020), herdados do portal anterior.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
