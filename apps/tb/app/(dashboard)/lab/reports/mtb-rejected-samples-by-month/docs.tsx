import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBRejectedSamplesByMonthDocs() {
  return (
    <CardDocs
      overview="Evolução mensal do número de amostras rejeitadas nos laboratórios com testes Xpert MTB. Serve para acompanhar as rejeições ao longo do tempo."
      legend={[
        {
          label: "Amostras Rejeitadas",
          color: "#f54a00",
          description: "Total de amostras rejeitadas no mês.",
        },
      ]}
      reading={[
        "O eixo horizontal tem os meses do período; o ano aparece junto ao mês quando o período passa de 13 meses ou abrange mais de um ano.",
        "A altura de cada barra é o número de amostras rejeitadas nesse mês.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Menu, Editar filtros: escolhe a província e o distrito do laboratório e o período.",
        "Menu: Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/laboratories/rejected_samples_by_month/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
