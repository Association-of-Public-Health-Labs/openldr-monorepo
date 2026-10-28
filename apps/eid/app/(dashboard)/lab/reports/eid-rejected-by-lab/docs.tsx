import { CardDocs } from "@/components/card-docs";
import { rejectionLegend } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras de diagnóstico precoce infantil (EID) rejeitadas em cada laboratório receptor, por motivo de rejeição."
      legend={rejectionLegend("default", "lab")}
      reading={[
        "Cada barra empilha os nove motivos de rejeição do laboratório receptor.",
        "O Total do ficheiro Excel (por laboratório) conta todas as amostras rejeitadas e pode ser superior à soma dos motivos: uma amostra rejeitada só com descrição (sem código) conta no Total mas em nenhum motivo (R10).",
        "Este cartão não tem descida de nível.",
        "✱2 O filtro de laboratórios aplica-se ao laboratório que recebeu a amostra (ReceivingFacilityCode), não ao que a analisou.",
      ]}
      filters={[
        "Editar período: intervalo de datas, aplicado à data de registo (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: laboratórios convencionais; filtra pelo laboratório receptor.",
      ]}
      notes={["Só entram amostras convencionais (IsPoc = No)."]}
      endpoint={ENDPOINT}
    />
  );
}
