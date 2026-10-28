import { CardDocs } from "@/components/card-docs";
import { LAB_TYPE_LEGEND } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por província, separadas em convencionais e PoC, com descida até à unidade sanitária."
      legend={LAB_TYPE_LEGEND}
      reading={[
        "Data de referência: data de análise. Contam-se todas as amostras com data de análise no período, incluindo as rejeitadas.",
        "A separação usa apenas IsPoc: Convencional = IsPoc No; PoC = IsPoc Yes. As barras são agrupadas, não empilhadas.",
        "Positivas e Negativas não são desenhadas: constam apenas do Excel exportado.",
        "Positivas e Negativas contam o resultado final (FinalResult); indeterminados e pendentes não entram em nenhuma das duas, por isso Positivas + Negativas pode ser inferior a Testadas.",
        "Clique numa barra para descer: província → distrito → unidade sanitária. No último nível, a lista de pacientes está disponível apenas para Administradores.",
        "O subtítulo mostra o caminho percorrido (por exemplo, Gaza → Chókwè).",
        "As amostras sem província, distrito ou unidade sanitária registados não são contadas em nenhum nível.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Reiniciar o relatório volta ao nível das províncias.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
