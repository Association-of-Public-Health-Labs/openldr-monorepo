import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Taxa de supressão viral por província requisitante e, ao clicar numa província, por distrito, no período seleccionado."
      reading={[
        "A cor indica a faixa da taxa de supressão (suprimidas ÷ amostras com resultado): verde escuro ≥95% (meta), verde claro 90–94%, amarelo 80–89%, vermelho <80%, cinzento sem dados.",
        "Clique numa província para ver os seus distritos; clique em «Moçambique» ou reinicie o relatório para voltar ao mapa nacional.",
        "Passe o cursor sobre uma província ou distrito para ver a taxa, as amostras testadas e os motivos de teste.",
        "Amostras sem província ou distrito requisitante não aparecem no mapa nem na exportação Excel, que exporta o nível visível.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
