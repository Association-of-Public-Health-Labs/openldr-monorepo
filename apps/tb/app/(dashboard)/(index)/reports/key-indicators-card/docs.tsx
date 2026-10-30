import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function KeyIndicatorsDocs() {
  return (
    <CardDocs
      overview="Tabela mensal com os principais indicadores das amostras testadas com Xpert MTB, a nível nacional."
      reading={[
        "Cada linha é um indicador: Amostras Analisadas, Resultados Positivos, Resultados Negativos, Inválidos e Erros.",
        "Cada coluna é um mês do período, com o ano. Quando há mais de 12 meses, os nomes dos meses aparecem abreviados.",
        "Cada célula é o número de amostras desse indicador nesse mês.",
      ]}
      options={[
        "Separadores Todos, Ultra e XDR: Todos junta os dois testes; Ultra mostra só o Xpert MTB Ultra (6 Cores) e XDR só o Xpert MTB XDR (10 Cores).",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel e Reiniciar o relatório (últimos 12 meses, separador Todos).",
      ]}
      endpoint="/tb/gx/summary/positivity_by_month/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
