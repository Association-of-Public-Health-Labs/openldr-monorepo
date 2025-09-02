export default function Docs() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold mb-2">Relatório de Amostras Testadas por Sexo</h2>
                <p>
                    Este relatório apresenta o volume de amostras de tuberculose testadas, desagregadas por Sexo (masculino, feminino), permitindo identificar 
                    padrões de testes específicos por Sexo em diferentes níveis administrativos.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Objetivo</h3>
                <p>
                    O objetivo é apresentar o volume de amostras de tuberculose testadas, segmentadas por Sexo (masculino, feminino), permitindo identificar 
                    padrões de testes específicos por Sexo em diferentes níveis administrativos.
                </p>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Visualização por gráfico empilhado agrupado:</strong> Mostra a distribuição de testes por Sexo</li>
                    <li><strong>Navegação hierárquica:</strong> Permite drill-down de província → distrito → unidade sanitária → pacientes</li>
                    <li><strong>Filtros dinâmicos:</strong> Permite filtrar por intervalo de tempo e tipo de unidade sanitária</li>
                    <li><strong>Exportação para Excel:</strong> Exporta os dados do gráfico em formato Excel com formatação adequada</li>
                    <li><strong>Exportação de imagem:</strong> Permite salvar o gráfico como imagem PNG ou JPEG</li>
                    <li><strong>Subtítulo dinâmico:</strong> Exibe automaticamente o período selecionado e contexto da navegação</li>
                    <li><strong>Modal de pacientes:</strong> Acesso aos dados individuais dos pacientes ao nível da unidade sanitária</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Estrutura dos Dados</h3>
                <p>
                    Os dados são organizados por:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Sexo:</strong> Masculino, Feminino</li>
                    <li><strong>Níveis Administrativos:</strong> Província → Distrito → Unidade Sanitária → Pacientes</li>
                    <li><strong>Períodos:</strong> Dados mensais agregados por intervalo selecionado</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Utilidade Epidemiológica</h3>
                <p>
                    Este gráfico é útil para:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Identificar diferenças de Sexo na prevalência de amostras testadas</li>
                    <li>Orientar estratégias de prevenção específicas por Sexo</li>
                    <li>Monitorar padrões de amostras testadas em populações masculinas e femininas</li>
                    <li>Apoiar decisões de tratamento baseadas em evidências de Sexo</li>
                    <li>Planejar campanhas de sensibilização direcionadas por Sexo</li>
                </ul>
            </div>

            <div>
                <h3 className="text-md font-medium mb-2">Interpretação</h3>
                <p>
                    A análise dos dados permite identificar:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Disparidades de Sexo na prevalência de amostras testadas</li>
                    <li>Unidades sanitárias com maior prevalência de amostras testadas por Sexo</li>
                    <li>Tendências temporais específicas por Sexo</li>
                    <li>Padrões que podem indicar fatores de risco específicos por Sexo</li>
                </ul>
            </div>

            <div className="bg-yellow-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Considerações de Sexo</h4>
                <p className="text-sm text-yellow-700">
                    As diferenças de Sexo na TB podem refletir fatores sociais, económicos e biológicos. 
                    Considere contextos culturais locais ao interpretar disparidades entre Sexos na 
                    prevalência de amostras testadas.
                </p>
            </div>
        </div>
    );
}