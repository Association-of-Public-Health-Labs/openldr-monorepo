export default function Docs() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold mb-2">
                    Relatório de Amostras Registadas por Unidade Sanitária
                </h2>
                <p>
                    Este relatório apresenta o total de <strong>amostras registadas</strong>{" "}
                    disaggregadas por província, distrito e unidade sanitária.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Objetivo</h3>
                <p>
                    O objetivo é apresentar o volume de amostras de tuberculose registadas a
                    nível nacional, permitindo o acompanhamento da cobertura e capacidade de
                    registo do sistema de saúde em diferentes níveis administrativos.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                        <strong>Visualização hierárquica:</strong> Mostra dados por província,
                        distrito e unidade sanitária
                    </li>
                    <li>
                        <strong>Navegação por drill-down:</strong> Permite explorar dados desde
                        província até unidade sanitária
                    </li>
                    <li>
                        <strong>Filtros dinâmicos:</strong> Permite filtrar por intervalo de tempo
                        e tipo de unidade sanitária
                    </li>
                    <li>
                        <strong>Exportação para Excel:</strong> Exporta os dados do gráfico em
                        formato Excel com formatação adequada
                    </li>
                    <li>
                        <strong>Exportação de imagem:</strong> Permite salvar o gráfico como imagem
                        PNG ou JPEG
                    </li>
                    <li>
                        <strong>Subtítulo dinâmico:</strong> Exibe automaticamente o período
                        selecionado em formato português
                    </li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Estrutura dos Dados</h3>
                <p>Os dados são organizados por:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                        <strong>Níveis Administrativos:</strong> Província → Distrito → Unidade
                        Sanitária
                    </li>
                    <li>
                        <strong>Períodos:</strong> Dados mensais agregados por intervalo selecionado
                    </li>
                    <li>
                        <strong>Métricas:</strong> Número total de amostras registadas no sistema
                    </li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Utilidade Operacional</h3>
                <p>Este gráfico é útil para:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Orientar intervenções específicas por província e distrito</li>
                    <li>Monitorar a capacidade de registo das unidades sanitárias</li>
                    <li>Identificar unidades com baixo volume de registo</li>
                    <li>Avaliar a cobertura do sistema de diagnóstico de TB</li>
                    <li>Planejar distribuição de recursos e equipamentos</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Interpretação</h3>
                <p>A análise dos dados permite identificar:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Unidades sanitárias com maior volume de registo de amostras</li>
                    <li>Disparidades regionais na capacidade de diagnóstico</li>
                    <li>Tendências temporais no volume de registos</li>
                    <li>Necessidades de fortalecimento do sistema de diagnóstico</li>
                </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Nota Técnica</h4>
                <p className="text-sm text-blue-700">
                    Os dados refletem apenas as amostras registadas no sistema OpenLDR e podem
                    não representar o volume total de amostras processadas. Para análises
                    completas de cobertura, considere também dados de outras fontes do sistema de
                    saúde.
                </p>
            </div>
        </div>
    );
}