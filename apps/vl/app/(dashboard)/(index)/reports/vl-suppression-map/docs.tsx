import { CardDocs } from "@/components/card-docs";
import { SUPPRESSION_BANDS } from "@/lib/vl/suppression";
import { ENDPOINT, FACILITY_ENDPOINT } from "./constants";

const BAND_DESCRIPTIONS: Record<string, string> = {
  target: "Taxa de supressão de 95% ou mais.",
  good: "Taxa de 90% a 94%.",
  mid: "Taxa de 80% a 89%.",
  low: "Taxa abaixo de 80%.",
  none: "Sem amostras com resultado.",
};

export default function Docs() {
  return (
    <CardDocs
      overview="Taxa de supressão viral por província requisitante, por distrito ao clicar numa província e por unidade sanitária ao clicar num distrito, no período seleccionado."
      legend={SUPPRESSION_BANDS.map((band) => ({ label: band.label, color: band.color, description: BAND_DESCRIPTIONS[band.id] }))}
      reading={[
        "A cor indica a faixa da taxa de supressão (suprimidas ÷ amostras com resultado): quanto mais escuro o verde, maior a supressão.",
        "Passe o cursor sobre uma província ou distrito para ver a taxa, as amostras testadas e os motivos de teste.",
        "Na tabela de um distrito, cada linha é uma unidade sanitária requisitante: amostras testadas, amostras com menos de 1000 cópias/ml e a taxa de supressão (com a mesma fórmula do mapa). A última linha soma o distrito.",
        "Amostras sem província ou distrito requisitante não aparecem no mapa. A exportação Excel exporta o nível visível, incluindo a tabela de unidades sanitárias.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Clique numa província para ver os seus distritos e num distrito para ver as suas unidades sanitárias.",
        "Na tabela, ordene clicando no título de uma coluna e procure uma unidade pelo nome.",
        "No topo, o botão de voltar e os nomes do caminho (Moçambique • Província • Distrito) levam ao nível anterior; Reiniciar o relatório volta ao mapa nacional.",
      ]}
      endpoint={`${ENDPOINT} e ${FACILITY_ENDPOINT}`}
    />
  );
}
