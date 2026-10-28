import { CardDocs } from "@/components/card-docs";
import { REJECTION_REASONS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

const DESCRIPTIONS = [
  "Códigos REPIT e SPUN2.",
  "Códigos INS e UNS.",
  "Códigos RSA, NSRP e SDBSA.",
  "Códigos ERRTC, ACC e PROBT.",
  "Código SASOB.",
  "Código DUPRG.",
  "Código NAME.",
  "Código AM30D.",
  "Qualquer outro código de rejeição, incluindo REJOL e PRTLA (nos cartões de laboratório contam como Outros).",
];

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras de diagnóstico precoce infantil (EID) rejeitadas em cada mês, por motivo de rejeição."
      legend={REJECTION_REASONS.map((r, i) => ({ label: r.label, color: r.color, description: DESCRIPTIONS[i] }))}
      reading={[
        "Cada barra empilha os nove motivos de rejeição do mês.",
        "O Total do ficheiro Excel conta todas as amostras rejeitadas e pode ser superior à soma dos motivos: uma amostra rejeitada só com descrição (sem código) conta no Total mas em nenhum motivo (R10).",
        "Os meses são os da data de registo da amostra.",
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
