import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { ENDPOINT, INACTIVE_DAYS } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Quantas pessoas usam os dashboards, com que frequência, e quantas contas deixaram de os usar."
      reading={[
        "Utilizadores activos: utilizadores distintos com pelo menos uma página vista no período.",
        "Sessões: períodos de utilização contínua; uma nova sessão começa após mais de 30 minutos sem actividade no mesmo dashboard.",
        "Sessões por utilizador: sessões ÷ utilizadores activos.",
        `Utilizadores inactivos: contas activas sem acesso há mais de ${INACTIVE_DAYS} dias, segundo o último acesso registado no Clerk. Contas bloqueadas e convites pendentes não contam. Este valor não depende do período.`,
        "A tendência compara com o período imediatamente anterior, com o mesmo número de dias.",
      ]}
      options={["Período e dashboard: filtros no topo da página."]}
      endpoint={`/usage${ENDPOINT}`}
      notes={["Os dados de utilização cobrem apenas o período desde o início do acompanhamento."]}
    />
  );
}
