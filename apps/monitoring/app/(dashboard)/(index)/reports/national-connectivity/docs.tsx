import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { OFFLINE_COLOR, ONLINE_COLOR } from "@/lib/monitoring/colors";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Parte do tempo laboral em que os sites monitorizados do SIS-LAB (Disalab, DisaPoC e DisaLink) estiveram com e sem internet nos últimos 12 meses."
      legend={[
        { label: "Online", color: ONLINE_COLOR, description: "Tempo laboral com ligação." },
        { label: "Offline", color: OFFLINE_COLOR, description: "Tempo laboral sem ligação, segundo o TeamViewer." },
      ]}
      reading={[
        "Tempo laboral: 08:00–16:00 UTC, de segunda a sexta. O tempo offline de cada site vem do DisaStatus, que já exclui os feriados nacionais; a capacidade é o tempo laboral do período vezes o número de sites.",
        "A mesma regra dá a percentagem dos cartões do topo, por categoria. \"Offline agora\" nesses cartões é o último estado registado de cada site, não o período.",
        "Os valores são arredondados à unidade e limitados a 0–100%.",
      ]}
      options={["Exportar para Excel e Exportar imagem no menu do cartão."]}
      endpoint={ENDPOINT}
    />
  );
}
