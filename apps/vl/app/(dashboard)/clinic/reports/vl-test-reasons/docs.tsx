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
        "Gráfico em anel com Motivo não especificado, Rotina e Falência Terapêutica: o total ao centro (o motivo sob o cursor ao passar por cima) e, na legenda, o número e a percentagem de cada motivo.",
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
