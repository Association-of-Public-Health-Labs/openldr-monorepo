import { CardDocs } from "@/components/card-docs";
import { TAT_BRACKET_LEGEND } from "@/lib/eid/legends";
import { TAT_SEGMENTS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras de diagnóstico precoce infantil (EID) convencionais por intervalo de dias de uma etapa do circuito, por laboratório. O título mostra a etapa escolhida (TRL - etapa)."
      legend={TAT_BRACKET_LEGEND}
      reading={[
        "Cada barra é um laboratório e empilha as suas amostras por intervalo de dias: <7, 7-15, 16-21, >21 e Sem datas (limites inclusivos).",
        "Sem datas: amostras em que falta a data de início ou de fim da etapa escolhida.",
        `As seis etapas, pela cadeia de datas colheita, recepção no Hub, registo no Hub, recepção no laboratório, registo no laboratório, análise, validação: ${TAT_SEGMENTS.map((s) => s.label).join("; ")}.`,
        "Este cartão não tem descida por província, distrito ou unidade sanitária.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: laboratórios convencionais.",
        "Segmento: escolhe a etapa (por omissão, a primeira: Colheita na US a Recepção no Hub). Reiniciar o relatório volta a esta etapa e limpa a selecção de laboratórios.",
      ]}
      notes={[
        "Só entram amostras não PoC (IsPoc = No), com o nome do laboratório de análise preenchido. Ao contrário do cartão de tempo médio, não se excluem as rejeitadas nem se aplica a regra completa de laboratório convencional.",
        "Datas: as do Hub têm de ser anteriores às do laboratório; o registo à análise demora no máximo 30 dias; o registo no Hub à recepção no laboratório e a colheita ao registo no Hub não podem ser negativos (sem limite de 90 dias).",
        "Os laboratórios PBC e UEM ficam excluídos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
