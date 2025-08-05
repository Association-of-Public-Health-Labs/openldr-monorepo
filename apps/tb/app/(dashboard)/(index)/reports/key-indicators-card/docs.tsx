export default function Docs() {
  return (
    <div>
      <p>
        Este relatório em formato de tabela apresenta os <strong>principais indicadores laboratoriais</strong> relacionados às amostras processadas pelos testes <strong>Xpert MTB</strong> (Ultra e XDR), distribuídos por mês ao longo dos últimos 12 meses.
      </p>

      <p>A tabela contém as seguintes métricas:</p>

      <ul>
        <li>
          <p><strong>Amostras Registadas:</strong> Total de amostras que foram registradas no sistema laboratorial.</p>
        </li>
        <li>
          <p><strong>Amostras Analisadas:</strong> Amostras que foram efetivamente processadas pelos equipamentos Genexpert.</p>
        </li>
        <li>
          <p><strong>MTB Detectado:</strong> Quantidade de amostras que tiveram resultado positivo para o Mycobacterium tuberculosis (TB).</p>
        </li>
        <li>
          <p><strong>MTB Não Detectado:</strong> Amostras com resultado negativo para TB.</p>
        </li>
        <li>
          <p><strong>Amostras Inválidas:</strong> Casos em que não foi possível obter um resultado válido por razões técnicas.</p>
        </li>
        <li>
          <p><strong>Erros:</strong> Amostras que apresentaram falha no processamento devido a erro técnico ou de equipamento.</p>
        </li>
      </ul>

      <p>
        Estes indicadores são fundamentais para o acompanhamento da <strong>eficiência operacional</strong>, <strong>qualidade dos testes</strong> e <strong>tendência epidemiológica</strong> da TB, possibilitando acções correctivas e melhorias contínuas no processo de diagnóstico.
      </p>
    </div>
  );
}
