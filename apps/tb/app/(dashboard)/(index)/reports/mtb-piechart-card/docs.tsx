import { ColorDisplay } from "@repo/design_system/app/atoms/utils/ColorDisplay";

export default function Docs() {
  return (
    <div>
      <p>
        Este relatório apresenta a distribuição dos resultados dos testes de TB Genexpert nas modalidades <strong>Ultra</strong> e <strong>XDR</strong>, com base nas amostras processadas nos últimos 12 meses.
      </p>

      <p>Os resultados estão agrupados nas seguintes categorias:</p>

      <p><strong>Ultra:</strong> Resultados das amostras testadas com o protocolo MTB ULTRA.</p>
      <ul>
        <li>
          <ColorDisplay color="var(--chart-1)" />
          <p><strong>MTB não detectado:</strong> Amostras em que o Mycobacterium tuberculosis (MTB) não foi identificado.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-2)" />
          <p><strong>MTB detectado:</strong> Amostras com presença confirmada de MTB.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-3)" />
          <p><strong>Inválidos:</strong> Amostras com resultados inválidos, não permitindo interpretação.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-4)" />
          <p><strong>Erros:</strong> Falha técnica no processo de testagem.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-5)" />
          <p><strong>Não analisados:</strong> Amostras recebidas, mas não processadas pelo equipamento.</p>
        </li>
      </ul>

      <p><strong>XDR:</strong> Resultados das amostras testadas com o XDR.</p>
      <ul>
        <li>
          <ColorDisplay color="var(--chart-1)" />
          <p><strong>MTB não detectado:</strong> Amostras sem presença de MTB.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-2)" />
          <p><strong>MTB detectado:</strong> MTB identificado na amostra.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-3)" />
          <p><strong>Inválidos:</strong> Resultados inválidos durante o teste.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-4)" />
          <p><strong>Erros:</strong> Ocorreram erros durante a execução do teste.</p>
        </li>
        <li>
          <ColorDisplay color="var(--chart-5)" />
          <p><strong>Não analisados:</strong> Amostras que não foram submetidas ao teste.</p>
        </li>
      </ul>
    </div>
  );
}
