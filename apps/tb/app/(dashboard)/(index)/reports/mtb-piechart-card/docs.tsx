import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBPieChartDocs() {
  return (
    <CardDocs
      overview="Distribuição dos resultados dos testes Xpert MTB a nível nacional, em percentagem do total do período."
      legend={[
        { label: "Resultados Positivos", color: "#f54a00", description: "Amostras com MTB detectado." },
        { label: "Resultados Negativos", color: "#009689", description: "Amostras com MTB não detectado." },
        { label: "Inválidos", color: "#104e64", description: "Amostras com resultado inválido." },
        { label: "Erros", color: "#ffba00", description: "Testes que terminaram com erro." },
        { label: "Não Preenchido", color: "#00E396", description: "Amostras registadas mas sem análise: registadas menos analisadas." },
      ]}
      reading={[
        "Cada fatia é um tipo de resultado, somado em todos os meses do período. A percentagem na fatia é o seu peso no total mostrado.",
        "Os tipos de resultado sem casos não aparecem no gráfico.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores). O título muda com o separador.",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/summary/positivity_by_month/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
