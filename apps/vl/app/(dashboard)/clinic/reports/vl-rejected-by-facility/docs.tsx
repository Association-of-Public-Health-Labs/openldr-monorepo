import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por local requisitante."
      reading={[
        "Uma barra por local.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimos 12 meses).",
        "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
        "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
      ]}
      notes={[
        "Janela pela data de registo, ambos os dias incluídos.",
        "✱ Rejeitada = código de rejeição LIMS ou HIVVL (o sistema anterior exigia os dois).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
