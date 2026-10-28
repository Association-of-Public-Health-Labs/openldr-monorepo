import { CardDocs } from "@/components/card-docs";
import { rejectionLegend } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras de diagnóstico precoce infantil (EID) rejeitadas em cada mês, por motivo de rejeição."
      legend={rejectionLegend("default", "summary")}
      reading={[
        "Cada barra empilha os nove motivos de rejeição do mês.",
        "O Total do ficheiro Excel conta todas as amostras rejeitadas e pode ser superior à soma dos motivos: uma amostra rejeitada só com descrição (sem código) conta no Total mas em nenhum motivo.",
        "Os meses são os da data de registo da amostra.",
      ]}
      filters={["Editar período: intervalo de datas, aplicado à data de registo (por omissão, últimos 12 meses)."]}
      notes={["Só entram amostras convencionais (não PoC)."]}
      endpoint={ENDPOINT}
    />
  );
}
