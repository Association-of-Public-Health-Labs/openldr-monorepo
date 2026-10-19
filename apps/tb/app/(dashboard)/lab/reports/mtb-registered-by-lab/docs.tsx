import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBRegisteredByLabDocs() {
  return (
    <CardDocs
      overview="Número de amostras registadas nos laboratórios com testes Xpert MTB, por província, distrito e laboratório. Serve para comparar o volume de registo entre locais."
      legend={[
        {
          label: "Amostras Registadas",
          color: "#f54a00",
          description: "Total de amostras registadas no período.",
        },
      ]}
      reading={[
        "Cada barra é uma província, um distrito ou um laboratório, conforme o nível em que se está.",
        "A altura da barra é o número de amostras registadas nesse local, no período escolhido.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Clique numa barra para descer um nível: Província, Distrito, Laboratório e, no último, a lista de dados dos pacientes desse laboratório.",
        "Menu, Editar filtros: escolhe a província e o distrito do laboratório e o período.",
        "Menu: Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/laboratories/registered_samples/"
      notes={["Por defeito, mostra os últimos 12 meses, por província."]}
    />
  );
}
