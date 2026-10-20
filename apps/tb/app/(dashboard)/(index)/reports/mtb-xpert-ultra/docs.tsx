import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBXpertUltraDocs() {
  return (
    <CardDocs
      overview="Resultado mensal dos testes Xpert MTB a nível nacional: quantas amostras tiveram MTB detectado, não detectado, inválido ou erro em cada mês."
      legend={[
        { label: "Resultado Positivo", color: "#f54a00", description: "Amostras com MTB detectado." },
        { label: "Resultado Negativo", color: "#009689", description: "Amostras com MTB não detectado." },
        { label: "Inválido", color: "#104e64", description: "Amostras com resultado inválido." },
        { label: "Erros", color: "#ffba00", description: "Testes que terminaram com erro." },
      ]}
      reading={[
        "O eixo horizontal tem os meses do período; o ano aparece junto ao mês quando o período passa de 13 meses ou abrange mais de um ano.",
        "O eixo vertical é o número de casos. As barras são empilhadas: cada cor é um tipo de resultado e o total da barra é a soma dos quatro.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores). O título muda com o separador.",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel, Exportar imagem e Reiniciar o relatório (últimos 12 meses, separador Ultra).",
      ]}
      endpoint="/tb/gx/summary/positivity_by_month/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
