import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês de análise, separadas por resultado."
      reading={[
        "CV > 1000 e CV < 1000 empilhados por mês.",
      ]}
      filters={[
        "Intervalo de datas.",
        "Laboratórios (sem selecção: todos).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
