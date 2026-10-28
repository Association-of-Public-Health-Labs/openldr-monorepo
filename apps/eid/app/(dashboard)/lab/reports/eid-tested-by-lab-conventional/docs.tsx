import { CardDocs } from "@/components/card-docs";
import { EID_PRIMARY, EID_SECONDARY } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por laboratório convencional, separadas por resultado (positivo ou negativo)."
      legend={[
        { label: "Positivo", color: EID_PRIMARY, description: "Amostras com resultado positivo." },
        { label: "Negativo", color: EID_SECONDARY, description: "Testadas menos Positivas." },
      ]}
      reading={[
        "Contam-se as amostras analisadas (com data de análise), excluídas as rejeitadas. Positivo = amostras positivas; Negativo = Testadas − Positivas (✱7), nunca inferior a zero.",
        "Convencional (✱6): amostra com IsPoc = No e não analisada em equipamento PIMA/MPIMA. Aplica-se a regra completa de laboratório convencional.",
        "Clique numa barra para descer um nível: laboratório → província → distrito → unidade sanitária. A unidade sanitária é o último nível.",
        "O subtítulo mostra o caminho percorrido (por exemplo, Lab X → Gaza → Chókwè).",
        "Reiniciar o relatório volta ao primeiro nível e limpa a selecção de laboratórios.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: laboratórios convencionais. A descida mantém-se dentro dos laboratórios escolhidos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
