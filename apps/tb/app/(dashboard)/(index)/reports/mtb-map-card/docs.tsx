import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBMapDocs() {
  return (
    <CardDocs
      overview="Mapa de Moçambique com a positividade dos testes Xpert MTB por província e, dentro de cada província, por distrito. Num distrito, a lista das suas unidades sanitárias."
      legend={[
        { label: "Ultra", color: "#e10d09", description: "Cor das províncias no separador Ultra." },
        { label: "XDR", color: "#fd9a00", description: "Cor das províncias no separador XDR." },
      ]}
      reading={[
        "A positividade de uma província é o número de amostras com MTB detectado a dividir pelo número de amostras testadas.",
        "Quanto mais forte a cor, maior a positividade. A legenda vai de 0% (cor clara) a 100% (cor forte).",
        "Na tabela de um distrito, cada linha é uma unidade sanitária requisitante: amostras testadas, positivas, negativas, inválidas, erros e a positividade (com a mesma fórmula do mapa). A última linha soma o distrito.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Clique numa província para ver os seus distritos, coloridos da mesma forma.",
        "Clique num distrito para ver a tabela das suas unidades sanitárias. Ordene clicando no título de uma coluna (por defeito, maior positividade primeiro) e procure uma unidade pelo nome.",
        "No topo, o botão de voltar e os nomes do caminho (Moçambique • Província • Distrito) levam ao nível anterior.",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel (o nível que está a ver, incluindo a tabela de unidades sanitárias), Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/tested_samples/"
      notes={[
        "Por defeito, mostra os últimos 12 meses.",
        "A tabela de unidades sanitárias usa o mesmo endpoint, com o distrito e a sua província como filtros.",
      ]}
    />
  );
}
