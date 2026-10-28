import { CardDocs } from "@/components/card-docs";
import { TAT_BRACKET_LEGEND } from "@/lib/eid/legends";
import { TAT_SEGMENTS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras convencionais de diagnóstico precoce infantil (EID) por intervalo de dias de uma etapa do circuito, por província, com descida até à unidade sanitária."
      legend={TAT_BRACKET_LEGEND}
      reading={[
        "Data de referência: data de análise. Cada barra empilha o número de amostras por intervalo de dias da etapa escolhida: <7, 7-15, 16-21, >21 e Sem datas (limites inclusivos).",
        "Sem datas: amostras em que falta a data de início ou de fim da etapa escolhida.",
        "Clique numa barra para descer: província → distrito → unidade sanitária. No último nível, a lista de pacientes está disponível apenas para Administradores: são as amostras convencionais analisadas nessa unidade sanitária no período, sem se limitar às que passam os filtros de qualidade do tempo de resposta.",
        "O subtítulo mostra o caminho percorrido (por exemplo, Gaza → Chókwè).",
        "Amostras sem província, distrito ou unidade sanitária registada não aparecem no gráfico; por isso o total da província pode ser superior à soma dos seus distritos.",
        `As seis etapas: ${TAT_SEGMENTS.map((s) => s.label).join("; ")}.`,
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Segmento: escolhe a etapa (por omissão, a primeira: Colheita na US a Recepção no Hub). O título indica a etapa. Reiniciar o relatório volta a esta etapa e ao nível das províncias."
      ]}
      notes={[
        "Só entram amostras convencionais (IsPoc = No), sem filtro de tipo de laboratório. Datas: as do Hub têm de ser anteriores às do laboratório; o laboratório não pode ser PBC; o registo à análise demora no máximo 30 dias.",
        "Ao contrário do cartão de tempo médio, não se exige que o registo no Hub à recepção no laboratório e a colheita ao registo no Hub sejam não negativos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
