import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ENDPOINT, LIMIT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview={`Os ${LIMIT} utilizadores com mais sessões no período.`}
      reading={[
        "Nome e email vêm do Clerk. Um utilizador que já não existe aparece como «Utilizador removido».",
        "Dashboards: os dashboards que o utilizador usou no período.",
        "Último acesso: a última página vista no período.",
        "Clique numa linha para abrir o utilizador na página Utilizadores.",
      ]}
      options={["Período e dashboard: filtros no topo da página."]}
      endpoint={`/usage${ENDPOINT}`}
      notes={["Os dados de utilização cobrem apenas o período desde o início do acompanhamento."]}
    />
  );
}
