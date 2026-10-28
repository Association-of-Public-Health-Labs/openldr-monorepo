import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Resumo mensal dos principais indicadores das amostras de diagnóstico precoce infantil (EID), agrupadas pelo mês de registo."
      reading={[
        "Tabela com um mês por coluna e um indicador por linha.",
        "Registadas: todas as amostras registadas no mês.",
        "Testadas: amostras registadas no mês que já têm resultado.",
        "Rejeitadas: amostras com código de rejeição.",
        "Pendentes: amostras sem resultado final (FinalResult).",
        "Convencional e PoC: o tipo de laboratório vem do campo de tipo de laboratório da amostra, e substitui a antiga separação pelo prefixo do RequestID.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Convencional / PoC: escolhe o tipo de laboratório (por omissão, Convencional).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
