import React from 'react';

const Docs = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Relatório de Amostras Rejeitadas por Motivo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Este relatório apresenta uma análise detalhada das amostras rejeitadas, categorizadas por motivo de rejeição
          e organizadas por unidade sanitária. O gráfico empilhado permite visualizar tanto o total de rejeições
          quanto a distribuição dos diferentes motivos para cada localização.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Categorias de Rejeição
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
          <div><strong>Registo Duplo:</strong> Amostras registadas mais de uma vez</div>
          <div><strong>Falha do Equipamento:</strong> Problemas técnicos com equipamentos</div>
          <div><strong>Amostra Insuficiente:</strong> Volume inadequado para análise</div>
          <div><strong>Acidente Laboratorial:</strong> Incidentes durante processamento</div>
          <div><strong>Reagente em Falta:</strong> Indisponibilidade de reagentes</div>
          <div><strong>Outros:</strong> Motivos não categorizados</div>
          <div><strong>Repetir Colheita:</strong> Necessidade de nova coleta</div>
          <div><strong>Amostra Não Rotulada:</strong> Identificação inadequada</div>
          <div><strong>Amostra Não Recebida:</strong> Problemas no transporte</div>
          <div><strong>Amostra Inadequada:</strong> Qualidade imprópria para teste</div>
          <div><strong>Erro Técnico:</strong> Falhas nos procedimentos técnicos</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Funcionalidades Principais
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>
            <strong>Gráfico Empilhado:</strong> Visualize múltiplos motivos de rejeição em uma única barra por localização
          </li>
          <li>
            <strong>Navegação Hierárquica:</strong> Explore dados de províncias → distritos → unidades sanitárias
          </li>
          <li>
            <strong>Drill-down Interativo:</strong> Clique nas barras para detalhar dados por nível geográfico
          </li>
          <li>
            <strong>Tabs Ultra/XDR:</strong> Alterne entre diferentes tipos de teste GeneXpert
          </li>
          <li>
            <strong>Exportação Completa:</strong> Excel com todas as categorias e imagem do gráfico
          </li>
          <li>
            <strong>Diálogo de Pacientes:</strong> Acesso a dados individuais ao nível da unidade sanitária
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Como Usar
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Selecione o intervalo de datas e unidades sanitárias desejadas</li>
          <li>Escolha entre as tabs &quot;Ultra&quot; ou &quot;XDR&quot; para diferentes tipos de teste</li>
          <li>Analise o gráfico empilhado para identificar padrões de rejeição</li>
          <li>Clique nas barras para explorar dados detalhados por província/distrito</li>
          <li>No nível da unidade sanitária, clique para ver dados individuais de pacientes</li>
          <li>Use os botões de exportação para salvar dados completos ou gráfico</li>
          <li>Use &quot;Reiniciar&quot; para voltar à visualização inicial</li>
        </ol>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Interpretação dos Dados
        </h3>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p>
            <strong>Análise de Padrões:</strong> O gráfico empilhado permite identificar rapidamente quais motivos
            são mais comuns em cada localização. Barras mais altas indicam maior número total de rejeições.
          </p>
          <p>
            <strong>Identificação de Problemas:</strong> Concentrações de cores específicas podem indicar problemas
            sistemáticos (ex: muitas &quot;Amostras Não Recebidas&quot; podem indicar problemas logísticos).
          </p>
          <p>
            <strong>Comparação Geográfica:</strong> Compare diferentes províncias/distritos para identificar
            locais que necessitam intervenções específicas ou melhores práticas.
          </p>
          <p>
            <strong>Monitoramento de Qualidade:</strong> Use os dados para implementar melhorias nos processos
            de coleta, transporte e processamento de amostras.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Notas Técnicas
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Dados atualizados em tempo real com mecanismo de retry automático</li>
          <li>Período padrão: últimos 12 meses de dados</li>
          <li>Exportação Excel inclui todas as categorias de rejeição e totais</li>
          <li>Suporte para tipos de teste Ultra (6 Cores) e XDR (10 Cores)</li>
          <li>Timeout de 60 segundos com retry exponencial para garantir confiabilidade</li>
          <li>Breadcrumb dinâmico mostra o caminho de navegação atual</li>
        </ul>
      </div>
    </div>
  );
};

export default Docs;
