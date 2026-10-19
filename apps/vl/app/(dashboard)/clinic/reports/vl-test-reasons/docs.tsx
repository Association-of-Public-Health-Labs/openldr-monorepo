import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Distribuição das amostras testadas pelos três motivos de teste do portal anterior."
      legend={[
        { label: "Motivo não especificado", color: "#00b000", description: "Amostras sem motivo indicado." },
        { label: "Rotina", color: "#fb8c00", description: "Testes de rotina." },
        { label: "Falência Terapêutica", color: "#ef5350", description: "Testes por falência terapêutica." },
      ]}
      reading={[
        "Gráfico circular com Motivo não especificado, Rotina e Falência Terapêutica.",
        "Outros motivos (por exemplo, repetição após aleitamento) não aparecem, tal como no portal anterior.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
      ]}
      notes={[
        "Os totais somam todos os locais da selecção.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
