import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Sensibilidade a um medicamento anti-tuberculose escolhido, por província, distrito ou unidade sanitária, nas amostras testadas."
      legend={[
        { label: "Resistente", color: "#f54a00", description: "Resistência ao medicamento detectada." },
        { label: "Sensível", color: "#009689", description: "Resistência ao medicamento não detectada." },
        { label: "Indeterminado", color: "#104e64", description: "Resistência ao medicamento indeterminada." },
      ]}
      reading={[
        "Cada barra é uma província, um distrito ou uma unidade sanitária, conforme o nível em que o relatório está.",
        "A barra é empilhada: cada cor é um resultado para o medicamento escolhido.",
        "O subtítulo mostra o período e o caminho seguido na navegação.",
      ]}
      options={[
        "Seletor de medicamento, por baixo do gráfico: Rifampicina (por omissão), Isoniazida, Fluoroquinolona, Kanamicina, Amicacina, Capreomicina ou Etionamida.",
        "Separadores Ultra e XDR: mudam o tipo de teste GeneXpert (Ultra 6 Cores ou XDR 10 Cores).",
        "Clicar numa barra desce um nível: Província → Distrito → Unidade Sanitária. Na unidade sanitária abre a lista de pacientes.",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/tested_samples_disaggregated_by_drug_type/"
      notes={["Por omissão mostra os últimos 12 meses, ao nível de província."]}
    />
  );
}
