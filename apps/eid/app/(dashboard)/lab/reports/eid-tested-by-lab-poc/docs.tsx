import { CardDocs } from "@/components/card-docs";
import { RESULT_COLORS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas em pontos de atendimento (PoC), por província, separadas por resultado (positivo ou negativo)."
      legend={[
        { label: "Positivo", color: RESULT_COLORS.positive, description: "Amostras com resultado positivo." },
        { label: "Negativo", color: RESULT_COLORS.negative, description: "Testadas menos Positivas." },
      ]}
      reading={[
        "Contam-se as amostras analisadas (com data de análise), excluídas as rejeitadas. Positivo = amostras positivas; Negativo = Testadas − Positivas (✱7), nunca inferior a zero.",
        "PoC (✱6): amostra marcada como PoC (IsPoc = Yes) ou analisada num equipamento PIMA/MPIMA. Aplica-se a regra completa de PoC.",
        "O primeiro nível é a província. Clique numa barra para descer: província → distrito → unidade sanitária. A unidade sanitária é o último nível.",
        "O subtítulo mostra o caminho percorrido (por exemplo, Gaza → Chókwè).",
        "Reiniciar o relatório volta ao nível das províncias e limpa a selecção de laboratórios.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: locais PoC. A descida mantém-se dentro dos locais escolhidos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
