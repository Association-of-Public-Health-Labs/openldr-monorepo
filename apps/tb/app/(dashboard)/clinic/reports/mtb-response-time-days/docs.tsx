import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Número de amostras respondidas dentro e fora do prazo, por província, distrito ou unidade sanitária, para o intervalo de tempo escolhido."
      legend={[
        { label: "Dentro do prazo (≤ 5, ≤ 7 ou ≤ 2 dias)", color: "#009689", description: "Amostras em que o intervalo escolhido foi igual ou inferior ao limite." },
        { label: "Fora do prazo (> 5, > 7 ou > 2 dias)", color: "#ef4444", description: "Amostras em que o intervalo escolhido ultrapassou o limite." },
      ]}
      reading={[
        "Cada barra é uma província, um distrito ou uma unidade sanitária, conforme o nível em que o relatório está.",
        "A altura de cada cor é o número de amostras dentro ou fora do prazo.",
        "O limite depende do intervalo: Colheita US → Recepção Lab, 5 dias; Colheita US → Validação no Lab, 7 dias; Recepção Lab → Validação no Lab, 2 dias.",
      ]}
      options={[
        "Seletor de intervalo, por baixo do gráfico: Colheita US → Recepção Lab (por omissão), Colheita US → Validação no Lab ou Recepção Lab → Validação no Lab.",
        "Separadores Ultra e XDR: mudam o tipo de teste GeneXpert (Ultra 6 Cores ou XDR 10 Cores).",
        "Clicar numa barra desce um nível: Província → Distrito → Unidade Sanitária. Na unidade sanitária abre a lista de pacientes.",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/trl_samples_by_days_tb/"
      notes={["Por omissão mostra os últimos 12 meses, ao nível de província."]}
    />
  );
}
