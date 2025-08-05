import { ColorDisplay } from "@repo/design_system/app/atoms/utils/ColorDisplay";

export default function Docs() {
  return (
    <div>
      <p>
        Este relatório apresenta a quantidade mensal de <strong>amostras rejeitadas</strong> durante o processo de testagem <strong>Xpert MTB Ultra e XDR</strong> ao longo dos últimos 12 meses.
      </p>

      <p>As rejeições são categorizadas de acordo com o motivo, permitindo a identificação de falhas recorrentes e oportunidades de melhoria no processo de coleta, transporte e análise laboratorial.</p>

      <p>Motivos de rejeição representados no gráfico:</p>

      <ul>
        <li><ColorDisplay color="var(--chart-1)" /> <p><strong>Amostra Insuficiente:</strong> Volume da amostra abaixo do mínimo necessário para testagem.</p></li>
        <li><ColorDisplay color="var(--chart-2)" /> <p><strong>Amostra Não Recebida:</strong> Amostra informada, mas não entregue ao laboratório.</p></li>
        <li><ColorDisplay color="var(--chart-3)" /> <p><strong>Amostra Inadequada para Teste:</strong> Material não compatível com os requisitos do teste.</p></li>
        <li><ColorDisplay color="var(--chart-4)" /> <p><strong>Falha de Equipamento:</strong> Rejeição causada por problemas técnicos no equipamento.</p></li>
        <li><ColorDisplay color="var(--chart-5)" /> <p><strong>Amostra Não Etiquetada:</strong> Amostras sem identificação ou com etiquetas ilegíveis.</p></li>
        <li><ColorDisplay color="var(--chart-6)" /> <p><strong>Acidente no Laboratório:</strong> Danos ocorridos no manuseio da amostra.</p></li>
        <li><ColorDisplay color="var(--chart-7)" /> <p><strong>Reagente Ausente:</strong> Impossibilidade de testagem por falta de insumos.</p></li>
        <li><ColorDisplay color="var(--chart-8)" /> <p><strong>Duplicação de Registo:</strong> Entrada repetida da mesma amostra no sistema.</p></li>
        <li><ColorDisplay color="var(--chart-9)" /> <p><strong>Erro Técnico:</strong> Falha na execução do procedimento laboratorial.</p></li>
        <li><ColorDisplay color="var(--chart-10)" /> <p><strong>Amostra Repetida:</strong> Rejeição por submissão repetida da mesma amostra.</p></li>
        <li><ColorDisplay color="var(--chart-11)" /> <p><strong>Outro:</strong> Outros motivos não especificados nas categorias anteriores.</p></li>
      </ul>

      <p>
        O monitoramento desses dados contribui para acções correctivas direccionadas, como capacitação de pessoal, melhorias nos processos de transporte e fortalecimento da cadeia de suprimentos laboratoriais.
      </p>
    </div>
  );
}
