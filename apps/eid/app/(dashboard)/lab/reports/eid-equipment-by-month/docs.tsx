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
        "O ficheiro Excel inclui a linha Testadas, com o total de amostras testadas do mês. Testadas conta também as amostras sem código de equipamento (nulo), que não pertencem a nenhum grupo, por isso pode ser maior do que a soma dos grupos.",
        "Os meses são os da data de análise da amostra.",
        "✱8 Os códigos de equipamento são comparados sem espaços à volta, e os códigos C680A, M200C, PNTHC e ALNTB, que o sistema anterior omitia, estão incluídos nos seus grupos; por isso os números podem ser superiores aos do sistema anterior.",
        "O laboratório PBC não é excluído neste cartão (só o cartão por laboratório o exclui).",
      ]}
      filters={[
        "Editar período: intervalo de datas, aplicado à data de análise (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: laboratórios convencionais; filtra pelo laboratório que analisou a amostra.",
      ]}
      notes={["Só entram resultados finais de amostras convencionais (IsPoc = No)."]}
      endpoint={ENDPOINT}
    />
  );
}
