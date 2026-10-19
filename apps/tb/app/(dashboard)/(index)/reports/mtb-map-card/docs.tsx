import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBMapDocs() {
  return (
    <CardDocs
      overview="Mapa de Moçambique com a positividade dos testes Xpert MTB por província, e por distrito dentro de cada província."
      legend={[
        { label: "Ultra", color: "#e10d09", description: "Cor das províncias no separador Ultra." },
        { label: "XDR", color: "#fd9a00", description: "Cor das províncias no separador XDR." },
      ]}
      reading={[
        "A positividade de uma província é o número de amostras com MTB detectado a dividir pelo número de amostras testadas.",
        "Quanto mais forte a cor, maior a positividade. A legenda vai de 0% (cor clara) a 100% (cor forte).",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Clique numa província para ver os seus distritos, coloridos da mesma forma. Em \"Moçambique\", no topo, volta ao mapa nacional.",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/tested_samples/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
