import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por laboratório, separadas por resultado de carga viral."
      legend={[
        { label: "CV > 1000", color: "#fb8c00", description: "Amostras não suprimidas." },
        { label: "CV < 1000", color: "#ef5350", description: "Amostras suprimidas." },
      ]}
      reading={[
        "CV > 1000: não suprimida.",
        "CV < 1000: suprimida.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Seleccionar laboratórios: grupos de laboratórios (sem selecção, ver nota).",
      ]}
      notes={[
        "Sem selecção de laboratórios: convencionais (códigos P*).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
