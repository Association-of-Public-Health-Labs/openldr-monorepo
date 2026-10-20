import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por sexo e resistência à rifampicina, por província, distrito ou unidade sanitária."
      legend={[
        { label: "Masculino - Resistente", color: "#00695c", description: "Homens com resistência à rifampicina detectada." },
        { label: "Masculino - Sensível", color: "#4db6ac", description: "Homens com resistência à rifampicina não detectada." },
        { label: "Feminino - Resistente", color: "#d63900", description: "Mulheres com resistência à rifampicina detectada." },
        { label: "Feminino - Sensível", color: "#ff7a47", description: "Mulheres com resistência à rifampicina não detectada." },
      ]}
      reading={[
        "Cada local tem duas colunas empilhadas lado a lado: uma para o sexo masculino (tons de verde) e outra para o feminino (tons de laranja).",
        "Em cada coluna, o tom escuro é o resistente e o tom claro é o sensível.",
        "O subtítulo mostra o período e o caminho seguido na navegação.",
      ]}
      options={[
        "Separadores Ultra e XDR: mudam o tipo de teste GeneXpert (Ultra 6 Cores ou XDR 10 Cores).",
        "Clicar numa barra desce um nível: Província → Distrito → Unidade Sanitária. Na unidade sanitária abre a lista de pacientes.",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/tested_samples_disaggregated_by_gender/"
      notes={["Por omissão mostra os últimos 12 meses, ao nível de província."]}
    />
  );
}
