import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês e a percentagem de amostras positivas, para o diagnóstico precoce infantil (EID)."
      legend={[
        { label: "Testadas", color: "#fda92d", description: "Amostras registadas no mês que já têm resultado (colunas, eixo da esquerda)." },
        { label: "Positividade (%)", color: "#006C9C", description: "Linha, em percentagem (eixo da direita)." },
      ]}
      reading={[
        "Cada coluna é um mês de registo; a altura é o número de amostras testadas (eixo da esquerda).",
        "A linha é a positividade = positivas ÷ testadas × 100 (eixo da direita). A versão anterior do painel calculava convencionais positivas ÷ total, que é um valor diferente. Meses sem amostras testadas mostram 0%.",
        "Testadas: amostras com resultado final. Pendentes (sem resultado final) não entram na positividade.",
        "As positivas convencionais e as positivas PoC não somam o total de positivas: há amostras sem analisador identificado, que contam como positivas mas não em nenhum dos dois tipos.",
        "A exportação para Excel inclui as positivas convencionais e PoC, além das testadas, positivas, negativas e indeterminadas.",
      ]}
      filters={["Editar período: intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
