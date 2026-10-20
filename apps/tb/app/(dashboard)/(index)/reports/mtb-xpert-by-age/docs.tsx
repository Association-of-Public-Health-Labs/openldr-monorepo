import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBXpertByAgeDocs() {
  return (
    <CardDocs
      overview="Resultado dos testes Xpert MTB por faixa etária do paciente, a nível nacional. Serve para ver em que idades há mais resultados positivos."
      legend={[
        { label: "Resultados Positivos", color: "#f54a00", description: "Amostras com MTB detectado." },
        { label: "Resultados Negativos", color: "#009689", description: "Amostras com MTB não detectado." },
        { label: "Erros", color: "#104e64", description: "Testes que terminaram com erro." },
        { label: "Inválido", color: "#ffba00", description: "Amostras com resultado inválido." },
      ]}
      reading={[
        "O eixo horizontal tem as faixas etárias, de 5 em 5 anos: 0-4, 5-9, até 60-64, e 65+.",
        "O eixo vertical é o número de casos. As barras são empilhadas: cada cor é um tipo de resultado.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/summary/positivity_by_lab_by_age/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
