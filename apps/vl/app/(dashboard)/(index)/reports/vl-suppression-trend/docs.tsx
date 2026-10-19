import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês, divididas em suprimidas e não suprimidas, com a taxa de supressão viral do mês."
      legend={[
        { label: "Suprimidas", color: "#00B000", description: "Amostras com CV < 1000 cópias/mL (colunas)." },
        { label: "Não suprimidas", color: "#EF5350", description: "Amostras com CV ≥ 1000 cópias/mL (colunas)." },
        { label: "Taxa de supressão", color: "#006C9C", description: "Linha, em percentagem; meta de 95% a tracejado." },
      ]}
      reading={[
        "Cada coluna é um mês de análise (data de análise); a altura é o número de amostras com resultado (eixo da esquerda).",
        "A linha é a taxa de supressão = suprimidas ÷ amostras com resultado × 100, com uma casa decimal (eixo da direita, 0–100%). Meses sem resultados mostram 0%.",
        "A linha tracejada marca a meta de 95% de supressão.",
        "Acima do gráfico, a legenda mostra os totais do período; passe o cursor sobre um mês para ver os valores.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
