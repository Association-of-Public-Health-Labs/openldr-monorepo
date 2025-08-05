import { ColorDisplay } from "@repo/design_system/app/atoms/utils/ColorDisplay";

export default function Docs() {
  return (
    <div>
      <p>
        Este relatório apresenta a distribuição mensal dos testes <strong>Xpert MTB Ultra</strong> realizados por tipo de amostra nos últimos 12 meses.
      </p>

      <p>O gráfico exibe o número de amostras testadas mensalmente, classificadas segundo o tipo de material biológico utilizado no exame:</p>

      <ul>
        <li>
          <ColorDisplay color="var(--chart-1)" />
          <p><strong>Sputum (escarro):</strong> Principal tipo de amostra usada na testagem para tuberculose.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-2)" />
          <p><strong>Feces (fezes):</strong> Utilizadas em casos pediátricos ou quando o escarro não está disponível.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-3)" />
          <p><strong>Urine (urina):</strong> Indicada em situações específicas como coinfecção TB-HIV.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-4)" />
          <p><strong>Blood (sangue):</strong> Usada em investigações complementares ou estudos.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-5)" />
          <p><strong>Other (outros):</strong> Inclui líquidos corporais (pleural, cefalorraquidiano, etc.) ou amostras não especificadas.</p>
        </li>
      </ul>

      <p>
        Esta análise permite entender a diversidade de tipos de amostras utilizadas na testagem, auxiliar na padronização dos procedimentos laboratoriais e identificar possíveis variações sazonais na colecta de determinados tipos de amostra.
      </p>
    </div>
  );
}
