import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas na faixa etária seleccionada, por local requisitante."
      reading={[
        "CV > 1000 e CV < 1000 empilhados por local.",
        "A faixa etária aparece no rodapé.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimos 12 meses).",
        "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
        "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
      ]}
      notes={[
        "Faixa por omissão: 15–49 anos. Altere-a em 'Alterar faixa etária'.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
