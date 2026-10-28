import { CardDocs } from "@/components/card-docs";
import { LAB_TYPE_LEGEND } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras registadas por mês, separadas em convencionais e PoC."
      legend={LAB_TYPE_LEGEND}
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
