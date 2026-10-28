import { CardDocs } from "@/components/card-docs";
import { EQUIPMENT_LEGEND } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras de diagnóstico precoce infantil (EID) testadas em cada mês, por grupo de equipamento de análise."
      legend={EQUIPMENT_LEGEND}
      reading={[
        "Cada barra empilha os sete grupos de equipamento do mês.",
        "O ficheiro Excel inclui a linha Testadas, com o total de amostras testadas do mês.",
        "Os meses são os da data de análise da amostra.",
        "Os códigos de equipamento são comparados sem espaços à volta.",
        "Testadas conta todas as amostras do mês, incluindo as sem código de equipamento (nulo): essas não pertencem a nenhum grupo, por isso Testadas pode ser maior do que a soma dos grupos.",
      ]}
      filters={["Editar período: intervalo de datas, aplicado à data de análise (por omissão, últimos 12 meses)."]}
      notes={[
        "Só entram resultados finais de amostras convencionais (não PoC).",
        "Os laboratórios não são excluídos.",
        "Os códigos C680A, M200C, PNTHC e ALNTB, que as listas antigas omitiam, estão incluídos nos seus grupos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
