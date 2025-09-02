import React from 'react';

const Docs = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Relatório de Amostras Rejeitadas
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Este relatório apresenta o número de amostras rejeitadas por unidade sanitária durante um período específico.
          As amostras podem ser rejeitadas por diversos motivos, incluindo problemas de qualidade, contaminação ou 
          procedimentos inadequados de coleta.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Funcionalidades Principais
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>
            <strong>Visualização Hierárquica:</strong> Navegue através de províncias, distritos e unidades sanitárias
          </li>
          <li>
            <strong>Drill-down Interativo:</strong> Clique nas barras do gráfico para explorar dados em níveis mais detalhados
          </li>
          <li>
            <strong>Exportação de Dados:</strong> Exporte os dados para Excel ou salve o gráfico como imagem
          </li>
          <li>
            <strong>Filtros Personalizáveis:</strong> Selecione intervalos de datas e unidades sanitárias específicas
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Como Usar
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Selecione o intervalo de datas desejado no formulário superior</li>
          <li>Escolha as unidades sanitárias específicas (opcional)</li>
          <li>Clique em "Pesquisar" para carregar os dados</li>
          <li>Clique nas barras do gráfico para explorar dados detalhados por província/distrito</li>
          <li>Use os botões de exportação para salvar os dados ou gráfico</li>
          <li>Use o botão "Reiniciar" para voltar à visualização inicial</li>
        </ol>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Interpretação dos Dados
        </h3>
        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p>
            <strong>Amostras Rejeitadas:</strong> Número total de amostras que foram rejeitadas durante o processamento.
            Um alto número de rejeições pode indicar problemas nos procedimentos de coleta ou no transporte das amostras.
          </p>
          <p>
            <strong>Análise por Unidade:</strong> Compare o desempenho entre diferentes unidades sanitárias para 
            identificar locais que podem necessitar de treinamento adicional ou melhorias nos procedimentos.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Notas Técnicas
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Os dados são atualizados em tempo real conforme novos registros são processados</li>
          <li>O período padrão mostra os últimos 12 meses de dados</li>
          <li>Todas as exportações incluem metadados sobre o período e filtros aplicados</li>
          <li>O sistema inclui mecanismos de retry para garantir a confiabilidade dos dados</li>
        </ul>
      </div>
    </div>
  );
};

export default Docs;
