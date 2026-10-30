import { CardDocs } from "@/components/card-docs";
import { LAB_TYPE_LEGEND } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras registadas por mês, separadas em convencionais e PoC."
      legend={LAB_TYPE_LEGEND}
      reading={[
        "Data de referência: data de registo da amostra. Contam-se todas as amostras registadas, incluindo as rejeitadas.",
        "A separação usa apenas IsPoc: Convencional = IsPoc No; PoC = IsPoc Yes. As barras são agrupadas, não empilhadas.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
