import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas nas unidades sanitárias, por província, distrito ou unidade sanitária, com o resultado do teste e a resistência à rifampicina."
      legend={[
        { label: "Resultados Positivos", color: "#f54a00", description: "MTB detectado." },
        { label: "Resultados Negativos", color: "#009689", description: "MTB não detectado." },
        { label: "Resultados Inválidos", color: "#104e64", description: "Testes com resultado inválido." },
        { label: "Resistentes a Rifampicina", color: "#ffba00", description: "Resistência à rifampicina detectada." },
        { label: "Sensíveis a Rifampicina", color: "#fd9a00", description: "Resistência à rifampicina não detectada." },
      ]}
      reading={[
        "Cada barra é uma província, um distrito ou uma unidade sanitária, conforme o nível em que o relatório está.",
        "As cores empilham-se na mesma barra; cada segmento é a contagem da respectiva série nesse local.",
        "O subtítulo mostra o período e o caminho seguido na navegação.",
      ]}
      options={[
        "Separadores Ultra e XDR: mudam o tipo de teste GeneXpert (Ultra 6 Cores ou XDR 10 Cores).",
        "Clicar numa barra desce um nível: Província → Distrito → Unidade Sanitária. Na unidade sanitária abre a lista de pacientes.",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/tested_samples_disaggregated/"
      notes={["Por omissão mostra os últimos 12 meses, ao nível de província."]}
    />
  );
}
