import { ColorDisplay } from "@repo/design_system/app/atoms/utils/ColorDisplay";

export default function Docs() {
  return (
    <div>
      <p>
        Este relatório apresenta a distribuição mensal dos resultados dos testes <strong>Xpert MTB Ultra e XDR</strong> realizados nos últimos 12 meses.
      </p>

      <p>O gráfico exibe o número total de amostras analisadas por mês, categorizadas de acordo com o resultado obtido:</p>

      <ul>
        <li>
          <ColorDisplay color="var(--chart-1)" />
          <p><strong>MTB Detectado:</strong> Casos em que o Mycobacterium tuberculosis foi identificado.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-2)" />
          <p><strong>MTB Não Detectado:</strong> Casos em que o MTB não foi identificado.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-3)" />
          <p><strong>Inválido:</strong> Amostras cujo resultado foi inconclusivo ou inválido.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-4)" />
          <p><strong>Erros:</strong> Testes que apresentaram falhas técnicas durante a execução.</p>
        </li>
      </ul>

      <p>
        A análise por mês permite acompanhar a tendência de testagem e o desempenho operacional ao longo do ano, identificando possíveis variações sazonais, picos de detecção e desafios na qualidade dos testes.
      </p>
    </div>
  );
}
