import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./actions";

export default function Docs() {
  return (
    <CardDocs
      overview="Distribuição nacional das amostras testadas pelo motivo de requisição do teste."
      legend={[
        { label: "Motivo não especificado", color: "#00b000", description: "Amostras sem motivo indicado." },
        { label: "Rotina", color: "#fb8c00", description: "Testes de rotina." },
        { label: "Falência Terapêutica", color: "#ef5350", description: "Testes por falência terapêutica." },
      ]}
      reading={[
        "Gráfico em anel: o total ao centro (o motivo sob o cursor ao passar por cima) e, na legenda, o número e a percentagem de cada motivo.",
        "Outros motivos (por exemplo, repetição após aleitamento) não aparecem, tal como no portal anterior.",
      ]}
      filters={["Editar período: intervalo de datas (por omissão, últimos 12 meses). O relatório é sempre nacional."]}
      notes={["Os mesmos números de «Amostras Testadas por Motivo» na página Província/Distrito/US sem filtro de locais."]}
      endpoint={ENDPOINT}
    />
  );
}
