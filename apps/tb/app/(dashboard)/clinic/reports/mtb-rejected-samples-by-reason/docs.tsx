import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas nas unidades sanitárias, por província, distrito ou unidade sanitária, separadas pelo motivo da rejeição."
      legend={[
        { label: "Registo Duplo", color: "#f54a00", description: "Amostras rejeitadas por registo duplicado." },
        { label: "Falha do Equipamento", color: "#009689", description: "Amostras rejeitadas por falha do equipamento." },
        { label: "Amostra Insuficiente", color: "#104e64", description: "Amostras rejeitadas por quantidade insuficiente de amostra." },
        { label: "Acidente Laboratorial", color: "#ffba00", description: "Amostras rejeitadas por acidente no laboratório." },
        { label: "Reagente em Falta", color: "#fd9a00", description: "Amostras rejeitadas por falta de reagente." },
        { label: "Outros", color: "#00E396", description: "Amostras rejeitadas por outros motivos." },
        { label: "Repetir Colheita", color: "#FEB019", description: "Amostras rejeitadas porque é preciso repetir a colheita." },
        { label: "Amostra Não Rotulada", color: "#FF4560", description: "Amostras rejeitadas por falta de rótulo." },
        { label: "Amostra Não Recebida", color: "#775DD0", description: "Amostras rejeitadas por não terem sido recebidas." },
        { label: "Amostra Inadequada", color: "#008FFB", description: "Amostras rejeitadas por serem inadequadas para o teste." },
        { label: "Erro Técnico", color: "#2E294E", description: "Amostras rejeitadas por erro técnico." },
      ]}
      reading={[
        "Cada barra é uma província, um distrito ou uma unidade sanitária, conforme o nível em que o relatório está.",
        "A barra é empilhada: cada cor é um motivo de rejeição e o total é o número de amostras rejeitadas nesse local.",
        "O subtítulo mostra o período e o caminho seguido na navegação.",
      ]}
      options={[
        "Separadores Ultra e XDR: mudam o tipo de teste GeneXpert (Ultra 6 Cores ou XDR 10 Cores).",
        "Clicar numa barra desce um nível: Província → Distrito → Unidade Sanitária. Na unidade sanitária abre a lista de pacientes.",
        "Editar filtros: escolher o nível (Província, Distrito ou Unidade Sanitária), as unidades e o período.",
        "O menu permite Exportar para Excel, Exportar imagem e Reiniciar o relatório.",
      ]}
      endpoint="/tb/gx/facilities/rejected_samples_by_reason/"
      notes={["Por omissão mostra os últimos 12 meses, ao nível de província."]}
    />
  );
}
