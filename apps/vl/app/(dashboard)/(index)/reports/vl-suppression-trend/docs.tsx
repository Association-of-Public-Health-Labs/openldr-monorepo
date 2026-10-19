import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês, divididas em suprimidas e não suprimidas, com a taxa de supressão viral do mês."
      reading={[
        "Cada coluna é um mês de análise (data de análise); a altura é o número de amostras com resultado.",
        "Verde: amostras suprimidas (CV < 1000 cópias/mL); vermelho: não suprimidas (CV ≥ 1000 cópias/mL). Eixo da esquerda.",
        "A linha é a taxa de supressão = suprimidas ÷ amostras com resultado × 100, com uma casa decimal (eixo da direita, 0–100%).",
        "A linha tracejada marca a meta de 95% de supressão.",
        "Passe o cursor sobre um mês para ver os valores. Meses sem resultados mostram 0%.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
