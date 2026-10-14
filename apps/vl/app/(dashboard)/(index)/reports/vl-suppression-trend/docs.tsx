import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Percentagem mensal de amostras com carga viral suprimida (CV < 1000 cópias/mL) entre as amostras analisadas."
      reading={[
        "Cada ponto é um mês de análise (data de análise).",
        "Valor = amostras suprimidas ÷ amostras com resultado × 100, arredondado.",
        "Meses sem resultados mostram 0%.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
