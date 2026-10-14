import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Distribuição das amostras testadas pelos três motivos de teste do portal anterior."
      reading={[
        "Rotina, Falência Terapêutica e Motivo não especificado.",
        "Outros motivos (por exemplo, repetição após aleitamento) não aparecem, tal como no portal anterior.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimos 12 meses).",
        "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
      ]}
      notes={[
        "Os totais somam todos os locais da selecção.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
