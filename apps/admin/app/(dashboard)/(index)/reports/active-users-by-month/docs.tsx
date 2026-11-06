import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { usageRegistry } from "@/lib/admin/usage";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Quantos utilizadores distintos usaram cada dashboard em cada um dos últimos 12 meses."
      legend={usageRegistry().map((d) => ({ label: d.name, color: d.color, description: "Utilizadores activos no mês." }))}
      reading={[
        "Cada ponto é o número de utilizadores distintos com pelo menos uma página vista no mês nesse dashboard.",
        "Cada linha tem o nome do dashboard no último ponto, além da cor, para se distinguirem sem depender da cor.",
        "Uma linha só começa no mês em que o acompanhamento desse dashboard começou; antes disso não há dados.",
      ]}
      options={["Mostra sempre os últimos 12 meses; não depende do período nem do dashboard seleccionados no topo."]}
      endpoint={`/usage${ENDPOINT}`}
      notes={["Os dados de utilização cobrem apenas o período desde o início do acompanhamento."]}
    />
  );
}
