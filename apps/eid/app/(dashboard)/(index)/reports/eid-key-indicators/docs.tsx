import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Resumo mensal dos principais indicadores das amostras de diagnóstico precoce infantil (EID), agrupadas pelo mês de registo."
      reading={[
        "Tabela com um mês por coluna e um indicador por linha.",
        "Registadas: todas as amostras registadas no mês.",
        "Testadas: amostras registadas no mês com data de análise.",
        "Rejeitadas: amostras com código de rejeição ou com descrição de rejeição.",
        "Pendentes: amostras sem resultado final (FinalResult).",
        "Convencional e PoC (✱6): PoC é uma amostra marcada como PoC (IsPoc = Yes) ou analisada num equipamento PIMA/MPIMA; Convencional é IsPoc = No e não analisada em PIMA/MPIMA. Uma amostra convencional sem código de equipamento fica fora de Convencional. Isto substitui a antiga separação pelo prefixo do RequestID.",
        "A exportação para Excel indica no subtítulo o tipo de laboratório das linhas exportadas.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Convencional / PoC: escolhe o tipo de laboratório (por omissão, Convencional).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
