import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ENDPOINT, LIMIT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview={`As ${LIMIT} páginas com mais visualizações no período, para saber que relatórios as pessoas realmente abrem.`}
      reading={[
        "Cada barra é o número de visualizações da página; o comprimento é relativo à página mais vista.",
        "«Sumário» é a página inicial de cada dashboard.",
      ]}
      options={["Período e dashboard: filtros no topo da página."]}
      endpoint={`/usage${ENDPOINT}`}
      notes={["Os dados de utilização cobrem apenas o período desde o início do acompanhamento."]}
    />
  );
}
