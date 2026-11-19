import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { OFFLINE_COLOR, ONLINE_COLOR } from "@/lib/monitoring/colors";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Parte do tempo em que os sites monitorizados do SIS-LAB (Disalab, DisaPoC e DisaLink) estiveram com e sem internet nos últimos 12 meses."
      legend={[
        { label: "Online", color: ONLINE_COLOR, description: "Tempo com ligação." },
        { label: "Offline", color: OFFLINE_COLOR, description: "Tempo sem ligação, segundo o TeamViewer." },
      ]}
      reading={[
        "Contam-se como o DisaStatus conta: os laboratórios (Disalab) a qualquer hora, todos os dias; os sites DisaPoC e DisaLink só em horário laboral (08:00–16:00 UTC, de segunda a sexta, sem feriados nacionais).",
        "Percentagem offline = minutos offline de todos os sites ÷ minutos possíveis (24 h por dia para cada Disalab, o horário laboral para cada DisaPoC e DisaLink).",
        "A mesma regra dá a percentagem dos cartões do topo, por categoria. \"Offline agora\" nesses cartões é o último estado registado de cada site, não o período.",
        "Os valores são arredondados à unidade e limitados a 0–100%.",
      ]}
      options={["Exportar para Excel e Exportar imagem no menu do cartão."]}
      endpoint={ENDPOINT}
    />
  );
}
