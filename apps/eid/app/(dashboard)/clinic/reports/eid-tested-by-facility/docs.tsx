import { CardDocs } from "@/components/card-docs";
import { EID_PRIMARY, EID_SECONDARY } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por província, separadas em convencionais e PoC, com descida até à unidade sanitária."
      legend={[
        { label: "Convencional", color: EID_SECONDARY, description: "Amostras com IsPoc = No." },
        { label: "PoC", color: EID_PRIMARY, description: "Amostras marcadas como PoC (IsPoc = Yes)." },
      ]}
      reading={[
        "Data de referência: data de análise. Contam-se as amostras analisadas, excluídas as rejeitadas.",
        "A separação usa apenas IsPoc: Convencional = IsPoc No; PoC = IsPoc Yes. As barras são agrupadas, não empilhadas.",
        "Positivas e Negativas não são desenhadas: constam apenas do Excel exportado. Negativas = Testadas − Positivas (✱7), nunca inferior a zero.",
        "Clique numa barra para descer: província → distrito → unidade sanitária. No último nível, a lista de pacientes está disponível apenas para Administradores.",
        "O subtítulo mostra o caminho percorrido (por exemplo, Gaza → Chókwè).",
        "Amostras sem província, distrito ou unidade sanitária registada não aparecem no gráfico; por isso o total da província pode ser superior à soma dos seus distritos.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Reiniciar o relatório volta ao nível das províncias.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
