import { CardDocs } from "@/components/card-docs";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por laboratório, separadas por resultado de carga viral."
      reading={[
        "CV > 1000: não suprimida.",
        "CV < 1000: suprimida.",
      ]}
      filters={[
        "Intervalo de datas.",
        "Laboratórios (sem selecção: laboratórios convencionais, códigos P*).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
