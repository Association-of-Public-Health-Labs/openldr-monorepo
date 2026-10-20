import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Tempo médio, em dias, de cada etapa do circuito da amostra, mês a mês, para as unidades sanitárias seleccionadas."
      legend={[
        { label: "Colheita US → Recepção Lab", color: "#3498db", description: "Dias entre a colheita na unidade sanitária e a recepção no laboratório." },
        { label: "Recepção Lab → Registo no Lab", color: "#2ecc71", description: "Dias entre a recepção e o registo no laboratório." },
        { label: "Registo no Lab → Análise no Lab", color: "#f39c12", description: "Dias entre o registo e a análise no laboratório." },
        { label: "Análise no Lab → Validação no Lab", color: "#e74c3c", description: "Dias entre a análise e a validação no laboratório." },
      ]}
      reading={[
        "Cada barra é um mês do período escolhido.",
        "O eixo vertical é a média em dias; as cores empilham-se, por isso a altura total é a soma dos tempos médios das quatro etapas.",
        "O subtítulo mostra o período e as unidades seleccionadas.",
      ]}
      options={[
        "Separadores Ultra e XDR: mudam o tipo de teste GeneXpert (Ultra 6 Cores ou XDR 10 Cores).",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar como Imagem e Reiniciar.",
      ]}
      endpoint="/tb/gx/facilities/trl_samples_avg_by_days_by_month/"
      notes={["Por omissão mostra os últimos 12 meses, sem filtro de unidade."]}
    />
  );
}
