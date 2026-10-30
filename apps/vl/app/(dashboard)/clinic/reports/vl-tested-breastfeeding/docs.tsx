import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas de mulheres lactantes, por local requisitante."
      legend={[
        { label: "CV > 1000", color: "#fb8c00", description: "Amostras não suprimidas." },
        { label: "CV < 1000", color: "#ef5350", description: "Amostras suprimidas." },
      ]}
      reading={[
        "CV > 1000 e CV < 1000 empilhados por local.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
        "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
      ]}
      notes={[
        "Lactante = Sim/Yes, sem distinção de maiúsculas.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
