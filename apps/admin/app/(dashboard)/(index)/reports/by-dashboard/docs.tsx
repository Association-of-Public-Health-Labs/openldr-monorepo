import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Quem usa cada dashboard e com que frequência, no período seleccionado."
      reading={[
        "Activos: utilizadores distintos com pelo menos uma página vista no dashboard.",
        "Sessões: períodos de utilização contínua nesse dashboard.",
        "Por utilizador: sessões ÷ activos.",
      ]}
      options={["Período: filtro no topo da página. O filtro de dashboard não se aplica a este quadro, que mostra todos."]}
      endpoint={`/usage${ENDPOINT}`}
      notes={["Os dados de utilização cobrem apenas o período desde o início do acompanhamento."]}
    />
  );
}
