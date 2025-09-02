export default function Docs() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold mb-2">Relatório de Amostras Testadas por Unidade Sanitária</h2>
                <p>
                    Este relatório apresenta o total de <strong>amostras testadas</strong> desagregadas por província, distrito e unidade sanitária.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Objetivo</h3>
                <p>
                    O objetivo é apresentar o volume de amostras de tuberculose testadas a nível nacional,
                    permitindo o acompanhamento da capacidade laboratorial e eficiência do sistema de
                    diagnóstico em diferentes níveis administrativos.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Visualização hierárquica:</strong> Mostra dados por província, distrito e unidade sanitária</li>
                    <li><strong>Navegação por drill-down:</strong> Permite explorar dados desde província até unidade sanitária</li>
                    <li><strong>Filtros dinâmicos:</strong> Permite filtrar por intervalo de tempo e tipo de unidade sanitária</li>
                    <li><strong>Exportação para Excel:</strong> Exporta os dados do gráfico em formato Excel com formatação adequada</li>
                    <li><strong>Exportação de imagem:</strong> Permite salvar o gráfico como imagem PNG ou JPEG</li>
                    <li><strong>Subtítulo dinâmico:</strong> Exibe automaticamente o período selecionado em formato português</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Estrutura dos Dados</h3>
                <p>
                    Os dados são organizados por:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Níveis Administrativos:</strong> Província → Distrito → Unidade Sanitária</li>
                    <li><strong>Períodos:</strong> Dados mensais agregados por intervalo selecionado</li>
                    <li><strong>Métricas:</strong> Número total de amostras processadas e testadas</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Utilidade Operacional</h3>
                <p>
                    Este gráfico é útil para:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Orientar intervenções específicas por província e distrito</li>
                    <li>Monitorar a capacidade laboratorial das unidades sanitárias</li>
                    <li>Avaliar a eficiência do processamento de amostras</li>
                    <li>Identificar gargalos no sistema de diagnóstico</li>
                    <li>Planejar distribuição de recursos laboratoriais</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Interpretação</h3>
                <p>
                    A análise dos dados permite identificar:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Unidades sanitárias com maior capacidade de processamento</li>
                    <li>Diferenças entre amostras registadas e testadas (eficiência laboratorial)</li>
                    <li>Tendências temporais na capacidade de testagem</li>
                    <li>Necessidades de fortalecimento da capacidade laboratorial</li>
                </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Nota Técnica</h4>
                <p className="text-sm text-blue-700">
                    Os dados refletem apenas as amostras testadas no sistema OpenLDR. A diferença entre
                    amostras registadas e testadas pode indicar atrasos no processamento ou limitações
                    na capacidade laboratorial das unidades sanitárias.
                </p>
            </div>
        </div>
    );
}
