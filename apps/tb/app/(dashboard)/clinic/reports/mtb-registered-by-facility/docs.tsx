import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras registadas nas unidades sanitárias, por província, distrito ou unidade sanitária, no período escolhido."
      legend={[
        { label: "Amostras Registadas", color: "#f54a00", description: "Total de amostras registadas em cada província, distrito ou unidade sanitária." },
      ]}
      reading={[
        "Cada barra é uma província, um distrito ou uma unidade sanitária, conforme o nível em que o relatório está.",
        "A altura da barra é o total de amostras registadas nesse local.",
        "O subtítulo mostra o período e o caminho seguido na navegação.",
      ]}
      options={[
        "Separadores Ultra e XDR: mudam o tipo de teste GeneXpert (Ultra 6 Cores ou XDR 10 Cores).",
        "Clicar numa barra desce um nível: Província → Distrito → Unidade Sanitária. Na unidade sanitária abre a lista de pacientes.",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/registered_samples/"
      notes={["Por omissão mostra os últimos 12 meses, ao nível de província."]}
    />
  );
}
