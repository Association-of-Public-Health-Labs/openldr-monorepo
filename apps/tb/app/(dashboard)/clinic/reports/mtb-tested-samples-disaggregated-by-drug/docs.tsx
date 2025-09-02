export default function Docs() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold mb-2">Relatório de Sensibilidade aos Medicamentos por Unidade Sanitária</h2>
                <p>
                    Este relatório apresenta o total de <strong>amostras testadas</strong> disagregadas por medicamento e unidade sanitária.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Objetivo</h3>
                <p>
                    O objetivo é apresentar o volume de amostras de tuberculose testadas a nível nacional por medicamento,
                    permitindo a análise de padrões de resistência e sensibilidade aos medicamentos anti-TB
                    em diferentes níveis administrativos.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Visualização por gráfico empilhado:</strong> Mostra a distribuição de resistência por medicamento</li>
                    <li><strong>Navegação hierárquica:</strong> Permite drill-down de província → distrito → unidade sanitária</li>
                    <li><strong>Filtros dinâmicos:</strong> Permite filtrar por intervalo de tempo, tipo de unidade sanitária e medicamento</li>
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
                    <li><strong>Medicamentos:</strong> RIF (Rifampicina), INH (Isoniazida), EMB (Etambutol), SM (Estreptomicina)</li>
                    <li><strong>Resultados:</strong> Resistente, Sensível, Indeterminado</li>
                    <li><strong>Níveis Administrativos:</strong> Província → Distrito → Unidade Sanitária</li>
                    <li><strong>Períodos:</strong> Dados mensais agregados por intervalo selecionado</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Utilidade Clínica</h3>
                <p>
                    Este gráfico é útil para:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Orientar intervenções específicas por medicamento e região</li>
                    <li>Identificar padrões de resistência por unidade sanitária</li>
                    <li>Apoiar decisões de tratamento baseadas em evidências locais</li>
                    <li>Monitorar tendências de resistência ao longo do tempo</li>
                    <li>Planejar estratégias de controlo da TB resistente</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Interpretação</h3>
                <p>
                    A análise dos dados permite identificar:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Unidades sanitárias com maior prevalência de resistência</li>
                    <li>Medicamentos com maior taxa de resistência por região</li>
                    <li>Padrões de multirresistência (MDR-TB) e resistência extensiva (XDR-TB)</li>
                    <li>Tendências que indicam necessidade de ajustes nos protocolos</li>
                </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Nota Técnica</h4>
                <p className="text-sm text-blue-700">
                    Os dados são atualizados em tempo real e refletem apenas as amostras processadas
                    no sistema OpenLDR. Para análises epidemiológicas completas, considere também
                    dados de outras fontes e contextos clínicos específicos da região.
                </p>
            </div>
        </div>
    );
}
