import { ColorDisplay } from "@repo/design_system/app/atoms/utils/ColorDisplay";

export default function Docs() {
    return (
        <div>
            <p>
                Este relatório apresenta a distribuição dos resultados dos testes <strong>Xpert MTB Ultra e XDR</strong> por faixa etária, com base nas amostras analisadas nos últimos 12 meses.
            </p>

            <p>O objetivo é avaliar a ocorrência da tuberculose nas diferentes faixas etárias, permitindo identificar grupos etários com maior número de casos testados ou detectados.</p>

            <p>As categorias de resultados representadas no gráfico são:</p>

            <ul>
                <li>
                    <ColorDisplay color="var(--chart-1)" />
                    <p><strong>MTB Detectado:</strong> Casos em que o Mycobacterium tuberculosis foi identificado na amostra.</p>
                </li>
                <li>
                    <ColorDisplay color="var(--chart-2)" />
                    <p><strong>MTB Não Detectado:</strong> Amostras com resultado negativo para MTB.</p>
                </li>
                <li>
                    <ColorDisplay color="var(--chart-3)" />
                    <p><strong>Erros:</strong> Testes que apresentaram falha técnica durante a execução.</p>
                </li>
                <li>
                    <ColorDisplay color="var(--chart-4)" />
                    <p><strong>Inválido:</strong> Amostras cujo resultado foi inconclusivo.</p>
                </li>
            </ul>

            <p>
                Este gráfico é útil para orientar intervenções específicas por faixa etária.
            </p>
        </div>
    );
}
