import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Sensibilidade a um medicamento anti-tuberculose escolhido, por faixa etária, nas amostras testadas nas unidades sanitárias seleccionadas."
      legend={[
        { label: "Resistente", color: "#f54a00", description: "Resistência ao medicamento detectada." },
        { label: "Sensível", color: "#009689", description: "Resistência ao medicamento não detectada." },
        { label: "Indeterminado", color: "#104e64", description: "Resistência ao medicamento indeterminada." },
      ]}
      reading={[
        "O eixo horizontal são as faixas etárias: 0-4, 5-9, 10-14 e assim por diante até 65+.",
        "Para cada faixa há uma barra por resultado; o valor é a soma das unidades sanitárias devolvidas pelo filtro.",
        "O subtítulo mostra o período e as unidades seleccionadas.",
      ]}
      options={[
        "Seletor de medicamento, por baixo do gráfico: Rifampicina (por omissão), Amicacina, Capreomicina, Etionamida, Kanamicina, Isoniazida ou Fluoroquinolona.",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/tested_samples_disaggregated_by_drug_type_by_age/"
      notes={["Por omissão mostra os últimos 12 meses, sem filtro de unidade. Clicar nas barras não faz nada neste cartão."]}
    />
  );
}
