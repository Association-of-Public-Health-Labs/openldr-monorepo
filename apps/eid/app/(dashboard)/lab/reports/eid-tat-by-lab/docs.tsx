import { CardDocs } from "@/components/card-docs";
import { TAT_SEGMENTS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio de resposta, em dias, das amostras de diagnóstico precoce infantil (EID) convencionais, por laboratório. Cada barra empilha as seis etapas do circuito."
      legend={TAT_SEGMENTS.map((s) => ({ label: s.label, color: s.color, description: "Média de dias desta etapa (inteiro, truncado)." }))}
      reading={[
        "Cada etapa é a média de dias entre duas datas consecutivas da cadeia: colheita, recepção no Hub, registo no Hub, recepção no laboratório, registo no laboratório, análise, validação.",
        "Uma média de 0 dias aparece como 1 dia (✱), como no sistema anterior.",
        "Clique numa barra para descer um nível: laboratório → província → distrito → unidade sanitária. A unidade sanitária é o último nível.",
        "O subtítulo mostra o caminho percorrido (por exemplo, Lab X → Gaza → Chókwè).",
        "Reiniciar o relatório volta ao primeiro nível e limpa a selecção de laboratórios.",
        "No Excel, abaixo do nível de laboratório, as colunas Província e Distrito acompanham cada linha.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: laboratórios convencionais. A descida mantém-se dentro dos laboratórios escolhidos.",
      ]}
      notes={[
        "Só entram amostras convencionais e não rejeitadas (sem código de rejeição), com o nome do laboratório de análise preenchido. Este cartão não tem filtro de tipo de laboratório.",
        "Datas: as do Hub têm de ser anteriores às do laboratório; o registo no Hub à recepção no laboratório demora entre 0 e 90 dias; o registo à análise demora no máximo 30 dias; a colheita ao registo no Hub não pode ser negativa.",
        "Os laboratórios PBC e PEM ficam excluídos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
