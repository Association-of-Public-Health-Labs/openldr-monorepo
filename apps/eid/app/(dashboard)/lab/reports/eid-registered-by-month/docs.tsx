import { CardDocs } from "@/components/card-docs";
import { EID_PRIMARY } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras registadas por mês, separadas em convencionais e PoC."
      legend={[
        { label: "Convencional", color: "#3987e5", description: "Amostras com IsPoc = No." },
        { label: "PoC", color: EID_PRIMARY, description: "Amostras marcadas como PoC (IsPoc = Yes)." },
      ]}
      reading={[
        "Contam-se todas as amostras registadas no mês, incluindo as rejeitadas; a separação usa apenas IsPoc.",
        "✱ O filtro de laboratórios aplica-se ao laboratório que recebeu a amostra (ReceivingFacilityCode), não ao laboratório que a analisou.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: laboratórios convencionais e locais PoC (estes com o sufixo (PoC)); filtra pelo laboratório receptor.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
