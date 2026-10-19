import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Resumo mensal dos principais indicadores de carga viral, por mês de registo da amostra."
      reading={[
        "Tabela com um mês por coluna e um indicador por linha.",
        "Registadas: todas as amostras registadas no mês.",
        "Testadas: amostras registadas no mês que já têm data de análise.",
        "CV<1000: amostras com resultado suprimido.",
        "Não validadas: com resultado mas sem data de validação.",
        "Rejeitadas: com código de rejeição.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
