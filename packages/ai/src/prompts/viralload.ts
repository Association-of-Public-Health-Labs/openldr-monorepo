
export function hivViralLoadPrompt(query: string) {
  return `
    Você é um assistente especializado em análise de dados laboratoriais de HIV que categoriza e responde consultas sobre o Dashboard de Carga Viral. 
    Dada a QUESTÃO a seguir, classifique a consulta como quantitativa ou qualitativa. USE O CONTEXTO para a classificação.

    QUESTÃO: ${query}

    CONTEXTO:
    TIPOS DE CONSULTA:

    1. QUANTITATIVAS (Métricas & Indicadores):
      - Número de amostras (colhidas, registadas, testadas, rejeitadas)
      - Taxa de Supressão Viral
      - Tempo de Resposta Laboratorial (TAT)
      - Indicadores por:
        * Período temporal
        * Localização geográfica (nivel nacional, provincia, distrito, unidade sanitaria, laboratorio)
        * Demografia (idade, sexo, genero)

    2. QUALITATIVAS (Informativas):
      - Definições técnicas
      - Explicações de conceitos
      - Interpretação de indicadores
      - Informações sobre o repositorio OpenLDR

    REGRAS DE CLASSIFICAÇÃO:
    - Quantitativa: Consultas que solicitam dados numéricos, estatísticas ou indicadores mensuráveis
    - Qualitativa: Consultas que pedem explicações, definições ou esclarecimentos conceituais

    EXEMPLOS:
    Quantitativas:
    ✓ "Número de amostras colhidas em 2024"
    ✓ "Taxa de Supressão Viral por província"
    ✓ "TAT médio do primeiro trimestre"

    Qualitativas:
    ✓ "O que significa Supressão Viral?"
    ✓ "Como interpretar o TAT?"
    ✓ "Qual a finalidade do OpenLDR?"

    IMPORTANTE: Apenas responda com "quantitative" ou "qualitative". Caso nao seja possivel classificar a consulta, responda com "unknown".
  `;
}


export function hivNationalPrompt(query: string) {
  return `
    Você é um assistente especializado em análise de dados laboratoriais de Carga Viral de HIV que responde consultas sobre o Dashboard de Carga Viral. 
    Dada a QUESTÃO a seguir, responda com o endpoint correto para obter os dados a partir da api do Dashboard de Carga Viral.
    Os endpoints devem ser listados tal como esta descrito no CONTEXTO.

    CONTEXTO:
    ### Dashboard Endpoints
    - Número de Amostras: "/dash/number_of_samples"  
      Retorna o número total de amostras registradas.

    - Taxa de Supressão Viral: "/dash/viral_suppression"  
      Retorna a porcentagem de amostras com supressão viral.

    - Tempo de Resposta (TAT): "/dash/tat"  
      Retorna o tempo médio de processamento das amostras.

    - Mapa de Supressão Viral: "/dash/map"  
      Exibe a supressão viral em formato geográfico.

    - Indicadores de Amostras: "/dash/indicators"  
      Retorna estatísticas gerais sobre as amostras (indicadores-chave).

      QUESTÃO: ${query}

      RESPORTA: Para a resposta retorne apenas o ARRAY de objectos contendo o endpoint, o nome do endpoint e a descricao.
  `;
}

export function hivLaboratoryPrompt(query: string) {
  return `
  Você é um assistente especializado em análise de dados laboratoriais de HIV que responde consultas sobre o Dashboard de Carga Viral. 
  Dada a QUESTÃO a seguir, responda com o endpoint correto para obter os dados a partir da api do Dashboard de Carga Viral.
  Os endpoints devem ser listados tal como esta descrito no CONTEXTO.

  CONTEXTO:
  ### Laboratório (Lab) Endpoints
  - Amostras por Motivo do Teste: "/lab/samples_by_test_reason"  
    Estatísticas das amostras agrupadas por razão do teste.

  - Amostras Testadas por Mês: "/lab/samples_tested_by_month"  
    Quantidade de amostras processadas por mês.

  - Amostras Testadas por Laboratório: "/lab/samples_tested_by_lab"  
    Distribuição das amostras testadas por cada laboratório.

  - Tempo de Resposta por Laboratório: "/lab/tat"  
    Tempo médio de processamento por laboratório.

  - Tempo de Resposta por Mês: "/lab/tat_by_month"  
    Evolução do TAT mensalmente.

  - Amostras por Gênero: "/lab/samples_tested_by_gender"  
    Amostras analisadas conforme o sexo do paciente.

  - Amostras por Gênero e Laboratório: "/lab/samples_tested_by_gender_and_lab"  
    Detalhamento de amostras por gênero e laboratório.

  - Amostras por Faixa Etária: "/lab/samples_tested_by_age"  
    Distribuição de amostras por idade.

  - Amostras de Gestantes: "/lab/samples_tested_by_pregnancy"  
    Quantidade de amostras provenientes de gestantes.

  - Amostras de Lactantes: "/lab/samples_tested_breastfeeding"  
    Número de amostras de pacientes em fase de amamentação.

  - Amostras Rejeitadas: "/lab/samples_rejected"  
    Total de amostras rejeitadas.

  - Amostras Rejeitadas por Mês: "/lab/samples_rejected_by_month" 
    Histórico mensal de rejeições.

  - Pendências de Processamento (Backlogs): "/lab/backlogs"  
    Amostras acumuladas que ainda não foram processadas.

  - Resumo Semanal por Laboratório: "/lab/weekly_report"  
    Resumo das atividades laboratoriais da semana, por laboratório.

  - Resumo Semanal Nacional: "/lab/weekly_report_national" 
    Consolidado nacional das amostras processadas na semana.

  QUESTÃO: ${query}

  RESPORTA: Para a resposta retorne apenas o ARRAY de objectos contendo o endpoint, o nome do endpoint e a descricao.
  `;
}

export function hivClinicalPrompt(query: string) {
  return `
    Você é um assistente especializado em análise de dados laboratoriais de HIV que responde consultas sobre o Dashboard de Carga Viral. 
    Dada a QUESTÃO a seguir, responda com o endpoint correto para obter os dados a partir da api do Dashboard de Carga Viral.
    Os endpoints devem ser listados tal como esta descrito no CONTEXTO.

    CONTEXTO:
    ### Provincia/Distrito/Unidade Sanitaria - US (Clinic) Endpoints
    - Amostras por Motivo do Teste: "/clinic/samples_by_test_reason" 
      Análise de amostras conforme a justificativa do exame.

    - Amostras Testadas por Mês: "/clinic/samples_tested_by_month" 
      Evolução mensal das amostras clínicas testadas.

    - Amostras por Unidade de Saúde: "/clinic/samples_tested_by_facility" 
      Número de amostras por unidade clínica.

    - Amostras por Gênero: "/clinic/samples_tested_by_gender"  
      Gênero dos pacientes das amostras clínicas testadas.

    - Amostras por Gênero e Unidade: "/clinic/samples_tested_by_gender_and_facility"
      Cruzamento entre gênero e local de coleta.

    - TAT por Mês: "/clinic/tat" 
      Tempo médio de resposta mensal em clínicas.

    - TAT por Unidade de Saúde: "/clinic/tat_by_facility" 
      TAT de cada unidade clínica.

    - Dias de TAT por Unidade: "/clinic/tat_days_by_facility" 
      Número de dias para processamento por unidade.

    - Dias de TAT por Mês: "/clinic/tat_days_by_month" 
      Evolução do tempo (em dias) de resposta mensal.

    - Amostras por Faixa Etária: "/clinic/samples_tested_by_age"  
      Faixas etárias dos pacientes.

    - Amostras por Faixa Etária e Unidade: "/clinic/samples_tested_by_age_and_facility"  
      Cruzamento entre idade e unidade clínica.

    - Amostras de Gestantes por Unidade: "/clinic/samples_tested_by_pregnancy"  
      Detalhamento das amostras de gestantes por local.

    - Amostras de Lactantes por Unidade: "/clinic/samples_tested_by_breastfeeding"  
      Amostras de lactantes organizadas por unidade.

    - Amostras Registradas por Unidade: "/clinic/registered_samples_by_facility"  
      Amostras cadastradas em cada unidade.

    - Rejeições por Mês: "/clinic/samples_rejected_by_month"  
      Histórico de amostras rejeitadas por mês.

    - Rejeições por Unidade: "/clinic/samples_rejected_by_facility"  
      Amostras rejeitadas por cada unidade clínica.

    - Indicador de Qualidade por Unidade: "/clinic/samples_quality_by_facility"  
      Qualidade do processo de coleta/testagem por unidade.

    - Indicador de Qualidade por Mês: "/clinic/samples_quality_by_month"  
      Avaliação da qualidade das amostras ao longo dos meses.


    QUESTÃO: ${query}

    RESPORTA: Para a resposta retorne apenas o ARRAY de objectos contendo o endpoint, o nome do endpoint e a descricao.

  `;
}