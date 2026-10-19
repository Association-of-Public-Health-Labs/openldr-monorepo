import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas na faixa etária seleccionada, por local requisitante."
      legend={[
        { label: "CV > 1000", color: "#fb8c00", description: "Amostras não suprimidas." },
        { label: "CV < 1000", color: "#ef5350", description: "Amostras suprimidas." },
      ]}
      reading={[
        "CV > 1000 e CV < 1000 empilhados por local.",
        "A faixa etária aparece no rodapé do cartão.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
        "Alterar faixa etária: idade mínima e máxima (0 a 120 anos).",
        "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
      ]}
      notes={[
        "Faixa por omissão: 15–49 anos.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
