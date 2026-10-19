import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Taxa de supressão viral por província requisitante e, ao clicar numa província, por distrito, no período seleccionado."
      legend={[
        { label: "Meta (≥95%)", color: "#00B000", description: "Taxa de supressão de 95% ou mais." },
        { label: "Boa (90–94%)", color: "#77ED8B", description: "Taxa de 90% a 94%." },
        { label: "Média (80–89%)", color: "#FFAB00", description: "Taxa de 80% a 89%." },
        { label: "Baixa (<80%)", color: "#EF5350", description: "Taxa abaixo de 80%." },
        { label: "Sem dados", color: "#C4CDD5", description: "Sem amostras com resultado." },
      ]}
      reading={[
        "A cor indica a faixa da taxa de supressão (suprimidas ÷ amostras com resultado).",
        "Passe o cursor sobre uma província ou distrito para ver a taxa, as amostras testadas e os motivos de teste.",
        "Amostras sem província ou distrito requisitante não aparecem no mapa nem na exportação Excel, que exporta o nível visível.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Clique numa província para ver os seus distritos; clique em «Moçambique» ou em Reiniciar o relatório para voltar ao mapa nacional.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
