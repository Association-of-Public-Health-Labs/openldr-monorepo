import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio de cada etapa do circuito da amostra, por mês de análise."
      reading={[
        "Quatro etapas empilhadas por mês.",
      ]}
      filters={[
        "Intervalo de datas.",
        "Laboratórios (sem selecção: convencionais, P*).",
      ]}
      endpoint={ENDPOINT}
      notes={[
        "✱ Sem limite de 90 dias.",
      ]}
    />
  );
}
