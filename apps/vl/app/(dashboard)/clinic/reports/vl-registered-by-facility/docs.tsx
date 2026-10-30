import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras registadas por local requisitante."
      legend={[
        { label: "Amostras Registadas", color: "#ef5350", description: "Amostras registadas no local." },
      ]}
      reading={[
        "Uma barra por província, distrito ou unidade sanitária, conforme o nível; a altura é o número de amostras registadas.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
        "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
      ]}
      notes={[
        "Período pela data de registo.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
