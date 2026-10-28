import { CardDocs } from "@/components/card-docs";
import { rejectionLegend } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por província, por motivo de rejeição, com descida até à unidade sanitária."
      legend={rejectionLegend("default", "province")}
      reading={[
        "Data de referência: data de análise. Conta apenas amostras convencionais (IsPoc = No) com código de rejeição preenchido.",
        "Cada barra empilha os nove motivos. O Total do ficheiro Excel conta todas as amostras com código de rejeição e pode ser superior à soma dos motivos (R10).",
        "Regra deste cartão (R20): REJOL e PRTLA contam como Outros. Os valores diferem dos cartões de rejeição do Sumário e do Laboratório, que usam a data de registo e outras regras.",
        "Clique numa barra para descer: província → distrito → unidade sanitária. No último nível, a lista de pacientes rejeitados está disponível apenas para Administradores.",
        "O subtítulo mostra o caminho percorrido (por exemplo, Gaza → Chókwè).",
        "Amostras sem província, distrito ou unidade sanitária registada não aparecem no gráfico; por isso o total da província pode ser superior à soma dos seus distritos.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Reiniciar o relatório volta ao nível das províncias.",
      ]}
      notes={["Este cartão não tem filtro de tipo de laboratório: só entram amostras convencionais."]}
      endpoint={ENDPOINT}
    />
  );
}
