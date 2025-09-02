export default function Docs() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold mb-2">Relatório de Resistência à Rifampicina por Unidade Sanitária</h2>
                <p>
                    Este relatório apresenta a resistência <strong>das amostras testadas à rifampicina</strong> desagregado por província, distrito e unidade sanitária.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Objetivo</h3>
                <p>
                    O objetivo é apresentar o volume de amostras de tuberculose com resistência à rifampicina,
                    permitindo o monitoramento da TB multirresistente (MDR-TB) e orientando estratégias
                    de controlo e tratamento em diferentes níveis administrativos.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Visualização hierárquica:</strong> Mostra dados por província, distrito e unidade sanitária</li>
                    <li><strong>Navegação por drill-down:</strong> Permite explorar dados desde província até unidade sanitária</li>
                    <li><strong>Diálogo de pacientes:</strong> Acesso aos dados individuais dos pacientes com resistência</li>
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
                    <li><strong>Resultados de Rifampicina:</strong> Resistente, Sensível, Indeterminado</li>
                    <li><strong>Níveis Administrativos:</strong> Província → Distrito → Unidade Sanitária → Pacientes</li>
                    <li><strong>Períodos:</strong> Dados mensais agregados por intervalo selecionado</li>
                    <li><strong>Dados de Pacientes:</strong> Informações individuais incluindo idade, género e resultados</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Utilidade Clínica</h3>
                <p>
                    Este gráfico é útil para:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Orientar intervenções específicas para controlo da MDR-TB</li>
                    <li>Identificar hotspots de resistência à rifampicina</li>
                    <li>Monitorar a eficácia das estratégias de controlo da TB resistente</li>
                    <li>Apoiar decisões de tratamento e isolamento de pacientes</li>
                    <li>Planejar distribuição de medicamentos de segunda linha</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Interpretação</h3>
                <p>
                    A análise dos dados permite identificar:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Unidades sanitárias com maior prevalência de resistência à rifampicina</li>
                    <li>Tendências temporais na emergência de MDR-TB</li>
                    <li>Padrões demográficos dos pacientes com TB resistente</li>
                    <li>Necessidades de fortalecimento da capacidade de diagnóstico molecular</li>
                </ul>
            </div>

            <div className="bg-red-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-1">Alerta Clínico</h4>
                <p className="text-sm text-red-700">
                    A resistência à rifampicina é um indicador de TB multirresistente (MDR-TB).
                    Casos positivos requerem investigação imediata, isolamento adequado e início
                    de tratamento com medicamentos de segunda linha conforme protocolo nacional.
                </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Nota Técnica</h4>
                <p className="text-sm text-blue-700">
                    Os dados são baseados em testes moleculares (GeneXpert) que detectam simultaneamente
                    M. tuberculosis e resistência à rifampicina. Resultados indeterminados podem
                    requerer repetição do teste ou métodos complementares de diagnóstico.
                </p>
            </div>
        </div>
    );
}
