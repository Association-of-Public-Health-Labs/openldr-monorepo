import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { MONITORING_PRIMARY, NO_DATA_COLOR } from "@/lib/monitoring/colors";

export default function Docs() {
  return (
    <CardDocs
      overview="Conectividade (% do tempo laboral com internet) dos sites monitorizados de cada província nos últimos 12 meses; ao clicar numa província, a dos seus distritos."
      legend={[
        { label: "Conectividade", color: MONITORING_PRIMARY, description: "Quanto mais escura a cor, maior a conectividade (escala absoluta, de 0% a 100%)." },
        { label: "Sem sites", color: NO_DATA_COLOR, description: "Nenhum site monitorizado na província ou no distrito." },
      ]}
      reading={[
        "Conectividade = 100% − tempo offline em horário laboral (08:00–16:00 UTC, segunda a sexta, sem feriados) ÷ tempo laboral de todos os sites da região.",
        "O cursor mostra a conectividade e o número de sites da região.",
        "Grafias diferentes do DisaStatus são juntadas na mesma região (por exemplo \"Maputo-Cidade\" em Maputo Cidade, \"Kampfumo\" em KaMpfumu). Sites sem província não aparecem no mapa, mas contam nos totais nacionais.",
      ]}
      options={[
        "Clique numa província para ver os seus distritos; o caminho no topo (Moçambique • Província) volta ao mapa nacional.",
        "Reiniciar o relatório volta ao mapa nacional. A exportação Excel exporta o nível visível.",
      ]}
      endpoint="/teamviewer/offline-grouped-statistics/interval-dates-province e interval-dates-district (DisaStatus), via /api/provinces e /api/districts"
    />
  );
}
