/**
 * MTB Tested Samples Disaggregated by Drug and Age Documentation
 * 
 * Purpose:
 * This component provides a comprehensive report on the total number of TB samples tested, 
 * disaggregated by drug and age group. It aims to facilitate the analysis of resistance patterns 
 * by age and support evidence-based treatment decisions.
 * 
 * Functionality:
 * The report includes the following features:
 * - Grouped bar chart visualization of samples by drug and age
 * - Dynamic filters for time period, health facility type, and specific drug
 * - Export to Excel with proper formatting
 * - Export as image (PNG or JPEG)
 * - Dynamic subtitle displaying the selected time period in Portuguese
 * 
 * Data Structure:
 * The data is organized by:
 * - Drugs: RIF (Rifampicin), INH (Isoniazid), EMB (Ethambutol), SM (Streptomycin)
 * - Age Groups: 0-14 years, 15-24 years, 25-34 years, 35-44 years, 45-54 years, 55-64 years, 65+ years
 * - Results: Resistant, Sensitive, Indeterminate
 * 
 * Clinical Utility:
 * This report is useful for:
 * - Guiding specific interventions by drug and age group
 * - Identifying resistance patterns in different age groups
 * - Supporting treatment decisions based on epidemiological evidence
 * - Monitoring resistance trends over time
 * - Planning age-targeted prevention strategies
 * 
 * Interpretation:
 * Analysis of the data allows for the identification of:
 * - Age groups with higher prevalence of resistance to specific drugs
 * - Drugs with higher resistance rates in certain age groups
 * - Trends that may indicate the need for adjustments in treatment protocols
 * - Patterns suggesting specific risk factors by age group
 */

export default function Docs() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold mb-2">Relatório de Sensibilidade aos Medicamentos por Idade</h2>
                <p>
                    Este relatório apresenta o total de <strong>amostras testadas</strong> disagregadas por medicamento e faixa etária.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Objetivo</h3>
                <p>
                    O objetivo é apresentar o volume de amostras de tuberculose testadas a nível nacional, 
                    organizadas por medicamento e segmentadas por grupos etários, permitindo uma análise 
                    detalhada dos padrões de resistência por idade.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Visualização por gráfico de barras agrupadas:</strong> Mostra a distribuição de amostras por medicamento e idade</li>
                    <li><strong>Filtros dinâmicos:</strong> Permite filtrar por intervalo de tempo, tipo de unidade sanitária e medicamento específico</li>
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
                    <li><strong>Faixas Etárias:</strong> 0-14 anos, 15-24 anos, 25-34 anos, 35-44 anos, 45-54 anos, 55-64 anos, 65+ anos</li>
                    <li><strong>Resultados:</strong> Resistente, Sensível, Indeterminado</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Utilidade Clínica</h3>
                <p>
                    Este gráfico é útil para:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Orientar intervenções específicas por medicamento e grupo etário</li>
                    <li>Identificar padrões de resistência em diferentes faixas etárias</li>
                    <li>Apoiar decisões de tratamento baseadas em evidências epidemiológicas</li>
                    <li>Monitorar tendências de resistência ao longo do tempo</li>
                    <li>Planejar estratégias de prevenção direcionadas por idade</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Interpretação</h3>
                <p>
                    A análise dos dados permite identificar:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Grupos etários com maior prevalência de resistência a medicamentos específicos</li>
                    <li>Medicamentos com maior taxa de resistência em determinadas idades</li>
                    <li>Tendências que podem indicar necessidade de ajustes nos protocolos de tratamento</li>
                    <li>Padrões que sugerem fatores de risco específicos por faixa etária</li>
                </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Nota Técnica</h4>
                <p className="text-sm text-blue-700">
                    Os dados são atualizados em tempo real e refletem apenas as amostras processadas 
                    no sistema OpenLDR. Para análises epidemiológicas completas, considere também 
                    dados de outras fontes e contextos clínicos específicos.
                </p>
            </div>
        </div>
    );
}