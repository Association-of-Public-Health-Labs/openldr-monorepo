import { CardDocs } from "@/components/card-docs";
import { EQUIPMENT_GROUPS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

const DESCRIPTIONS = [
  "Códigos ALINA, AL-IM, ALINB, ALIND e ALINK.",
  "Códigos ALNTA, ALNTY e ALNTB.",
  "Códigos M2000, M200A, M200B e M200C.",
  "Códigos C6800, C6800A, C6800B e C680A.",
  "Códigos PNTHA, PNTHR e PNTHC.",
  "Códigos MPIMA e PIMA.",
  "Códigos MANUA, MGIT e SYSMX, e amostras sem código de equipamento.",
];

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras de diagnóstico precoce infantil (EID) testadas em cada mês, por grupo de equipamento de análise."
      legend={EQUIPMENT_GROUPS.map((g, i) => ({ label: g.label, color: g.color, description: DESCRIPTIONS[i] }))}
      reading={[
        "Cada barra empilha os sete grupos de equipamento do mês.",
        "O ficheiro Excel inclui a linha Testadas, com o total de amostras testadas do mês.",
        "Os meses são os da data de análise da amostra.",
        "Os códigos de equipamento são comparados sem espaços à volta.",
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
