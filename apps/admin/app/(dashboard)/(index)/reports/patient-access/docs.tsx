import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Quem abriu nomes e registos de pacientes, em que dashboard e com que frequência."
      reading={[
        "Uma linha por utilizador e dashboard; Consultas é o número de vezes que foram abertos dados ao nível do paciente.",
        "Última consulta: data e hora da consulta mais recente no período.",
        "Um utilizador que já não existe aparece como «Utilizador removido».",
      ]}
      options={["Período e dashboard: filtros no topo da página."]}
      endpoint={`/usage${ENDPOINT}`}
      notes={["Os dados de utilização cobrem apenas o período desde o início do acompanhamento."]}
    />
  );
}
