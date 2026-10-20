import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês de análise, separadas por resultado."
      legend={[
        { label: "CV > 1000", color: "#fb8c00", description: "Amostras não suprimidas." },
        { label: "CV < 1000", color: "#ef5350", description: "Amostras suprimidas." },
      ]}
      reading={[
        "CV > 1000 e CV < 1000 empilhados por mês.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: grupos de laboratórios (sem selecção, ver nota).",
      ]}
      notes={[
        "Sem selecção de laboratórios: todos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
