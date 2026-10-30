import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês e sexo, separadas por resultado."
      legend={[
        { label: "Homens (CV < 1000)", color: "#00b000", description: "Homens com carga viral suprimida." },
        { label: "Homens (CV > 1000)", color: "rgba(0,176,0,0.4)", description: "Homens com carga viral não suprimida." },
        { label: "Mulheres (CV < 1000)", color: "#e74c3c", description: "Mulheres com carga viral suprimida." },
        { label: "Mulheres (CV > 1000)", color: "rgba(231,76,60,0.4)", description: "Mulheres com carga viral não suprimida." },
      ]}
      reading={[
        "Por mês, uma coluna para homens e outra para mulheres; a parte clara indica CV > 1000.",
      ]}
      filters={[
        "Editar filtros: nível (Província, Distrito ou Unidade Sanitária), locais e período (por omissão, últimos 12 meses).",
      ]}
      notes={[
        "Inclui amostras sem província requisitante quando não há filtro de local.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
