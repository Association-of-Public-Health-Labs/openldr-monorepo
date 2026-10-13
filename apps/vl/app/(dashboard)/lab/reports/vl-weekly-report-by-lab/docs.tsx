import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Desempenho semanal de cada laboratório: amostras registadas, testadas, por processar, capacidade e tempo de resposta."
      reading={[
        "Barras: Registadas, Testadas, Não processadas e Capacidade (eixo esquerdo).",
        "Linha: TRL médio em dias (eixo direito).",
        "Se o período tiver várias semanas, cada barra indica o laboratório e a semana.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, a semana completa mais recente; filtra pela data de início da semana).",
        "Laboratórios (menu 'Seleccionar laboratórios').",
      ]}
      endpoint={ENDPOINT}
      notes={[
        "Fonte: relatórios semanais (ReportData).",
      ]}
    />
  );
}
