import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas por local requisitante."
      legend={[
        { label: "Amostras Rejeitadas", color: "#ef5350", description: "Amostras com código de rejeição." },
      ]}
      reading={[
        "Uma barra por província, distrito ou unidade sanitária, conforme o nível.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
        "Clique numa barra para descer de nível: província → distrito → unidade sanitária. Na unidade sanitária, os Administradores vêem a lista de pacientes.",
      ]}
      notes={[
        "Período pela data de registo, ambos os dias incluídos.",
        "Rejeitada = código de rejeição LIMS ou HIVVL (o sistema anterior exigia os dois).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
