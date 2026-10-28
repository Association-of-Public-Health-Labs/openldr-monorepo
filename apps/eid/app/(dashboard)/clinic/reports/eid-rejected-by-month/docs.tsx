import { CardDocs } from "@/components/card-docs";
import { rejectionLegend } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por mês, por motivo de rejeição."
      legend={rejectionLegend("facility")}
      reading={[
        "Data de referência: data de análise. Conta apenas amostras convencionais (IsPoc = No) com código de rejeição preenchido.",
        "Variante «unidade sanitária» (R20): REJOL conta como Repetir Teste e PRTLA como Problemas Técnicos. No cartão por província ambos contam como Outros.",
        "Os valores diferem dos cartões de rejeição do Sumário e do Laboratório, que usam a data de registo e outras regras.",
        "O Total do ficheiro Excel pode ser superior à soma dos motivos (R10).",
        "Este cartão não tem descida de nível nem filtro de tipo de laboratório.",
      ]}
      filters={["Editar período: intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
