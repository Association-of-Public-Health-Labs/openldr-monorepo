import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por local e sexo, separadas por resultado."
      reading={[
        "Coluna verde: homens. Coluna vermelha: mulheres. A parte clara indica CV > 1000.",
      ]}
      filters={[
        "Intervalo de datas (por omissão, últimos 12 meses).",
        "Província, Distrito ou Unidade Sanitária (botão Editar). 'Unidade Sanitária' só para Administradores.",
        "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
      ]}
      notes={[
        "Sexo segundo o código HL7 (M/F).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
