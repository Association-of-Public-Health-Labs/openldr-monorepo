import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function MTBRejectedSamplesByMonthAndReasonDocs() {
  return (
    <CardDocs
      overview="Amostras rejeitadas em cada mês, a nível nacional, repartidas pelo motivo de rejeição. A linha tracejada marca o limiar de referência."
      legend={[
        { label: "Amostra Insuficiente", color: "#f54a00", description: "Quantidade de amostra insuficiente para o teste." },
        { label: "Amostra Não Recebida", color: "#009689", description: "Amostra não recebida no laboratório." },
        { label: "Amostra Inadequada para Teste", color: "#104e64", description: "Amostra imprópria para o teste." },
        { label: "Falha de Equipamento", color: "#ffba00", description: "Rejeição por falha do equipamento." },
        { label: "Amostra Não Etiquetada", color: "#fd9a00", description: "Amostra sem etiqueta de identificação." },
        { label: "Acidente no Laboratório", color: "#00E396", description: "Rejeição por acidente no laboratório." },
        { label: "Reagente Ausente", color: "#FEB019", description: "Rejeição por falta de reagente." },
        { label: "Duplicação de Registo", color: "#FF4560", description: "Amostra registada em duplicado." },
        { label: "Erro Técnico", color: "#775DD0", description: "Rejeição por erro técnico." },
        { label: "Amostra Repetida", color: "#008FFB", description: "Repetição da colheita da amostra." },
        { label: "Outro", color: "#2E294E", description: "Qualquer outro motivo." },
      ]}
      reading={[
        "O eixo horizontal tem os meses do período; o ano aparece junto ao mês quando o período passa de 13 meses ou abrange mais de um ano.",
        "A barra é empilhada: cada cor é um motivo de rejeição e o total da barra é o número de amostras rejeitadas nesse mês.",
        "A linha tracejada vermelha, \"Limiar (5%)\", está fixa no valor 5 do eixo vertical.",
      ]}
      options={[
        "Separadores Ultra e XDR: alternam entre os testes Xpert MTB Ultra (6 Cores) e Xpert MTB XDR (10 Cores).",
        "Menu, Editar período: escolhe as datas inicial e final.",
        "Menu: Exportar para Excel, Exportar como Imagem e Reiniciar.",
      ]}
      endpoint="/tb/gx/laboratories/rejected_samples_by_reason_by_month/"
      notes={["Por defeito, mostra os últimos 12 meses."]}
    />
  );
}
