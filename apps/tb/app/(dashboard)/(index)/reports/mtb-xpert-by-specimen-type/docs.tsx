import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBXpertBySpecimenTypeDocs() {
  return (
    <CardDocs
      overview="Número de amostras testadas com Xpert MTB em cada mês, repartidas pelo tipo de amostra, a nível nacional."
      legend={[
        { label: "Expectoração", color: "#f54a00", description: "Amostras de expectoração." },
        { label: "Fezes", color: "#009689", description: "Amostras de fezes." },
        { label: "Urina", color: "#104e64", description: "Amostras de urina." },
        { label: "Sangue", color: "#ffba00", description: "Amostras de sangue." },
        { label: "Líquido Pleural", color: "#7B2D8E", description: "Amostras de líquido pleural." },
        { label: "Outro", color: "#7f7f7f", description: "Outros tipos de amostra." },
      ]}
      reading={[
        "O eixo horizontal tem os meses do período; o ano aparece junto ao mês quando o período passa de 13 meses ou abrange mais de um ano.",
        "O eixo vertical é o número de casos. As barras são empilhadas: cada cor é um tipo de amostra e o valor é a soma de todas as faixas etárias.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/summary/sample_types_by_month/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
