import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Taxa de supressão viral por província requisitante no período seleccionado."
      reading={[
        "A intensidade da cor de cada província corresponde à taxa de supressão.",
        "Passe o cursor sobre uma província para ver a taxa, as amostras testadas e os motivos de teste.",
        "Amostras sem província requisitante não aparecem no mapa, mas constam da exportação Excel.",
      ]}
      filters={["Intervalo de datas (por omissão, últimos 12 meses)."]}
      endpoint={ENDPOINT}
    />
  );
}
