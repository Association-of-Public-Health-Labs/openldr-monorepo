import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Totais nacionais semanais de registo, testagem, amostras por processar e capacidade, com o tempo de resposta médio."
      reading={[
        "Barras: Registadas, Testadas e Não processadas.",
        "Linha roxa: Capacidade.",
        "Linha escura: TRL médio (eixo direito).",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimas 12 semanas).",
        "Laboratórios.",
      ]}
      endpoint={ENDPOINT}
      notes={[
        "O TRL nacional é a média simples dos TRL dos laboratórios.",
      ]}
    />
  );
}
