import { CardDocs } from "@/components/card-docs";
import { EID_PRIMARY } from "@/lib/eid/series";
import { DRILL_ENDPOINT, ENDPOINT, NO_DATA_COLOR } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras de diagnóstico precoce infantil (EID) por província requisitante, por distrito ao clicar numa província e por unidade sanitária ao clicar num distrito, no período seleccionado. Substitui a antiga página de província (/province/[nome]) do portal EID."
      legend={[
        { label: "Positividade", color: EID_PRIMARY, description: "Quanto mais escura a cor, maior a positividade, relativa à mais alta do mapa visível." },
        { label: "Sem dados", color: NO_DATA_COLOR, description: "Sem amostras no período." },
      ]}
      reading={[
        "Nível nacional: cada província tem a cor da sua positividade (positivas ÷ testadas) dividida pela mais alta das províncias; o cursor mostra Positividade, Registadas, Testadas, Convencional e PoC.",
        "Nível de província: três indicadores da província (Registadas, Testadas e Positividade, do mesmo pedido do mapa nacional) e o mapa dos seus distritos, com a mesma regra de cor.",
        "Nível de distrito: tabela das unidades sanitárias requisitantes, com Registadas, Testadas, Rejeitadas, Pendentes, Positivas e Positividade; a última linha soma o distrito. Amostras sem unidade sanitária aparecem como \"Sem unidade sanitária\".",
        "Nos níveis de distrito e de unidade sanitária, Convencional e PoC têm cada um as suas linhas (✱1); a antiga página de província mostrava os dados PoC nos dois separadores.",
        "Registadas, Rejeitadas e Pendentes contam as amostras registadas no período; Testadas e Positivas, as analisadas no período. Rejeitada = estado do resultado 'X', como no portal antigo; Pendente = sem resultado e não rejeitada.",
        "Positivas e Pendentes lêem o resultado final (FinalResult) de cada amostra, convencional ou PoC (✱7).",
        "Amostras sem província ou distrito requisitante não aparecem no mapa. A exportação Excel exporta o nível visível.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Clique numa província para ver os seus distritos e num distrito para ver as suas unidades sanitárias.",
        "Convencional / PoC (níveis de distrito e de unidade sanitária): escolhe o tipo de laboratório (por omissão, Convencional). O mapa nacional mostra todas as amostras.",
        "Na tabela, ordene clicando no título de uma coluna e procure uma unidade pelo nome.",
        "No topo, o caminho (Moçambique • Província • Distrito) leva ao nível anterior; Reiniciar o relatório volta ao mapa nacional, ao período por omissão e a Convencional.",
      ]}
      endpoint={`${ENDPOINT} e ${DRILL_ENDPOINT}`}
    />
  );
}
