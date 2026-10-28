import { CardDocs } from "@/components/card-docs";
import { EID_PRIMARY, EID_SECONDARY } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por mês, separadas por resultado (positivo ou negativo)."
      legend={[
        { label: "Positivo", color: EID_PRIMARY, description: "Amostras com resultado positivo." },
        { label: "Negativo", color: EID_SECONDARY, description: "Testadas menos Positivas." },
      ]}
      reading={[
        "Contam-se as amostras analisadas (com data de análise), excluídas as rejeitadas. Positivo = amostras positivas; Negativo = Testadas − Positivas (✱7), nunca inferior a zero.",
        "Todos: todas as amostras testadas. Convencional / PoC: nas rotas mensais a separação usa apenas IsPoc (PoC = Yes), sem a regra dos equipamentos PIMA/MPIMA; por isso os totais podem diferir dos cartões por laboratório.",
        "O título leva o sufixo (Convencional) ou (PoC) quando um destes separadores está escolhido.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Todos / Convencional / PoC: escolhe o tipo de laboratório (por omissão, Todos).",
        "Seleccionar laboratórios: laboratórios convencionais e locais PoC (estes com o sufixo (PoC)).",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
