import { CardDocs } from "@/components/card-docs";
import { REJECTION_REASONS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

const DESCRIPTIONS = [
  "Códigos REPIT, SPUN2 e REJOL.",
  "Códigos INS e UNS.",
  "Códigos RSA, NSRP e SDBSA.",
  "Códigos ERRTC, ACC, PROBT e PRTLA.",
  "Código SASOB.",
  "Código DUPRG.",
  "Código NAME.",
  "Código AM30D.",
  "Qualquer outro código de rejeição.",
];

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por mês, por motivo de rejeição."
      legend={REJECTION_REASONS.map((r, i) => ({ label: r.label, color: r.color, description: DESCRIPTIONS[i] }))}
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
