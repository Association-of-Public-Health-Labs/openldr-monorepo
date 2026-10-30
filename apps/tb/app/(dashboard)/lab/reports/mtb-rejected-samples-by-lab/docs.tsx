import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBRejectedSamplesByLabDocs() {
  return (
    <CardDocs
      overview="Número de amostras rejeitadas nos laboratórios com testes Xpert MTB, por província, distrito e laboratório. Serve para identificar onde há mais rejeições."
      legend={[
        {
          label: "Amostras Rejeitadas",
          color: "#f54a00",
          description: "Total de amostras rejeitadas no período.",
        },
      ]}
      reading={[
        "Cada barra é uma província, um distrito ou um laboratório, conforme o nível em que se está.",
        "A altura da barra é o número de amostras rejeitadas nesse local, no período escolhido.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Clique numa barra para descer um nível: Província, Distrito, Laboratório e, no último, a lista de dados dos pacientes desse laboratório.",
        "Menu, Editar filtros: escolhe a província e o distrito do laboratório e o período.",
        "Menu: Exportar para Excel e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/laboratories/rejected_samples/"
      notes={["Por defeito, mostra os últimos 12 meses, por província."]}
    />
  );
}
