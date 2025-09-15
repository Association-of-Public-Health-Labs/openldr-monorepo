import React from "react";

export default function Docs() {
  return (
    <div className="space-y-4">
      {/* Overview Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Visão Geral</h3>
        <p>
          Este relatório apresenta a distribuição das <strong>amostras registadas</strong> para os testes <strong>Xpert MTB Ultra e XDR</strong> por laboratório, 
          permitindo análise detalhada do volume de testagens em cada unidade laboratorial durante o período selecionado.
        </p>
      </div>

      {/* Chart Interpretation */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Interpretação do Gráfico</h3>
        <p>
          O gráfico de barras exibe o número total de amostras registadas em cada laboratório. 
          Cada barra representa um laboratório específico, facilitando a comparação do volume de testagens entre diferentes unidades.
        </p>
      </div>

      {/* Interactive Features */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Funcionalidades Interativas</h3>
        <div className="space-y-2">
          <p><strong>Navegação Hierárquica:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Clique numa província para ver os distritos</li>
            <li>Clique num distrito para ver os laboratórios</li>
            <li>Clique num laboratório para ver os dados dos pacientes (quando disponível)</li>
          </ul>
          
          <p><strong>Alternância de Abas:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Ultra:</strong> Dados do teste Xpert MTB Ultra 6 Cores</li>
            <li><strong>XDR:</strong> Dados do teste Xpert MTB XDR 10 Cores</li>
          </ul>
        </div>
      </div>

      {/* Export Options */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Opções de Exportação</h3>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>Excel:</strong> Exporta todos os dados em formato de planilha com formatação portuguesa</li>
          <li><strong>Imagem:</strong> Exporta o gráfico atual como imagem PNG de alta qualidade</li>
        </ul>
      </div>

      {/* Key Insights */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Principais Indicadores</h3>
        <p>Este relatório permite identificar:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>Laboratórios com maior volume de amostras registadas</strong></li>
          <li><strong>Distribuição geográfica das testagens por província e distrito</strong></li>
          <li><strong>Capacidade de processamento de cada laboratório</strong></li>
          <li><strong>Possíveis inconsistências nos dados de registo</strong></li>
          <li><strong>Tendências de utilização dos testes Ultra vs XDR</strong></li>
        </ul>
      </div>

      {/* Data Quality Notes */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Notas sobre Qualidade dos Dados</h3>
        <div className="space-y-2">
          <p>
            <strong>Dados "Not Specified":</strong> Indicam amostras registadas sem atribuição clara a uma localização específica. 
            Estes dados são importantes para monitoramento da qualidade do sistema de registo.
          </p>
          <p>
            <strong>Período de Dados:</strong> O relatório apresenta dados do período selecionado. 
            O subtítulo dinâmico mostra o intervalo de datas em formato português.
          </p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Como Usar</h3>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>Selecione o período desejado no filtro de datas</li>
          <li>Escolha a aba Ultra ou XDR conforme o tipo de teste</li>
          <li>Clique nas barras para navegar pela hierarquia geográfica</li>
          <li>Use "Reiniciar" para voltar à vista inicial</li>
          <li>Exporte os dados conforme necessário</li>
        </ol>
      </div>

      {/* Technical Notes */}
      <div className="text-sm text-gray-600">
        <h4 className="font-semibold mb-1">Notas Técnicas:</h4>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Os dados são atualizados em tempo real a partir do sistema OpenLDR</li>
          <li>As exportações incluem metadados do relatório para rastreabilidade</li>
          <li>O sistema implementa retry automático para garantir confiabilidade dos dados</li>
        </ul>
      </div>
    </div>
  );
}
