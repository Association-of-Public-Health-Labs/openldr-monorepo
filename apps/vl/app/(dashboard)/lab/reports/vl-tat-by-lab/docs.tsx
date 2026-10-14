import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio de cada etapa do circuito da amostra, por laboratório."
      reading={[
        "Quatro etapas empilhadas: Colheita à Recepção, Recepção ao Registo, Registo à Análise, Análise à Validação.",
      ]}
      filters={[
        "Intervalo de datas.",
        "Laboratórios (sem selecção: convencionais, P*).",
      ]}
      endpoint={ENDPOINT}
      notes={[
        "✱ Sem limite de 90 dias (o limite do sistema anterior nunca foi aplicado).",
      ]}
    />
  );
}
