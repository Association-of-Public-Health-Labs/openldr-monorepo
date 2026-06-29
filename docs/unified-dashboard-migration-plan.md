# Plano Tecnico de Migracao da Dashboard Unificada OpenLDR

## 1. Visao geral da reconstrucao

O objetivo da reconstrucao e consolidar as dashboards de Tuberculose, Viral Load e DPI/EID numa unica aplicacao frontend dentro do `openldr-monorepo`, usando o design system existente em `packages/design_system` como base visual e funcional.

A migracao deve preservar o comportamento analitico existente, mas reduzir a dispersao atual entre multiplos frontends, diferentes stacks de UI e endpoints legados. A nova aplicacao deve tratar cada dominio como uma feature independente, com rotas, cards, tipos e adapters proprios, partilhando apenas infraestrutura comum como layout, autenticacao, cliente HTTP, filtros, exportacoes, componentes de cards, tabelas e graficos.

Principios da reconstrucao:

- Usar `openldr-monorepo` como unica base de desenvolvimento frontend.
- Usar `api_openldr_python` como API analitica oficial para TB, Viral Load e DPI/EID.
- Migrar dashboards card a card, validando payloads e metricas em cada etapa.
- Evitar reescrita funcional ampla sem contratos claros de dados.
- Padronizar os cards sobre `packages/design_system`, especialmente `DashboardLayout`, `MainCard`, componentes de filtros, mapas, tabelas e dialogs.
- Isolar divergencias entre API legada e API nova em adapters por dominio.

## 2. Arquitetura atual dos 5 repositorios analisados

### openldr-monorepo

Repositorio principal em formato monorepo com `pnpm` e Turborepo. Contem aplicacoes e pacotes partilhados:

- `apps/tb`: dashboard de Tuberculose em Next.js App Router.
- `apps/main-app`: aplicacao Next.js ainda usada como base/demo.
- `apps/api-documentation`: documentacao de API.
- `packages/design_system`: design system principal.
- `packages/design_system_mui`: componentes MUI organizados por atoms/molecules/organisms/templates.
- `packages/auth`: pacote de autenticacao.
- `packages/ai`: funcionalidades de assistente/AI.
- `packages/utilities`: utilitarios partilhados.

O app `apps/tb` ja esta mais proximo da arquitetura pretendida: usa Next.js moderno, Clerk, `@repo/design_system` e endpoints da API Python via `NEXT_PUBLIC_OPENLDR_API`.

### api_openldr_python

API analitica nova em Flask, Flask-RESTful, SQLAlchemy, JWT e Swagger. Esta organizada por dominio:

- `tb/gxpert`: endpoints de Tuberculose GeneXpert.
- `hiv/vl`: endpoints de Viral Load.
- `hiv/eid`: endpoints de DPI/EID.
- `dict`: dicionarios de facilities e laboratories.
- `auth`: autenticacao.

Esta API deve ser considerada o contrato analitico oficial para a nova dashboard unificada.

### openldr-dashboard

Dashboard DPI/EID em Next.js Pages Router. Usa Auth0, MUI v4/v5, styled-components, Chart.js/ApexCharts e um design system local duplicado em `@design_system`.

Deve ser usado apenas como fonte de migracao da experiencia DPI/EID:

- paginas existentes;
- composicao dos cards;
- regras de filtros;
- transformacoes de dados;
- exportacoes;
- mapas e rotas de amostras;
- comportamento de drill-down quando aplicavel.

Nao deve ser usado como base arquitetural da nova aplicacao.

### openldr-frontend

Dashboard Viral Load em React CRA, React Router, React 16, Material UI v4, Chart.js e axios. Tambem contem paginas antigas de COVID-19.

Deve ser usado apenas como fonte de migracao da experiencia Viral Load:

- paginas Summary, Lab, Clinic, Patients/Results quando aplicavel;
- cards existentes;
- titulos, agrupamentos e comportamento de filtros;
- transformacoes e exportacoes;
- chamadas legadas para o backend Node.

Nao deve ser usado como base arquitetural da nova aplicacao.

### openldr-backend

API legada em Node.js/Express com modulos de Viral Load, EID weekly reports, COVID-19, auth e dicionarios.

Deve ser usado apenas como referencia legada para:

- nomes de endpoints antigos;
- comportamento historico de queries;
- endpoints ainda nao cobertos pela API Python;
- comparacao de payloads durante validacao.

Nao deve ser a API principal da dashboard unificada.

## 3. Decisao arquitetural recomendada

### openldr-monorepo como base principal

Toda a nova aplicacao frontend deve viver dentro de `openldr-monorepo`. Isto permite:

- reutilizar `packages/design_system`;
- centralizar scripts, build, lint e dependencias;
- reduzir duplicacao entre dashboards;
- facilitar padronizacao de layout, tema, auth e exportacoes;
- migrar incrementalmente sem apagar os repositorios antigos.

### api_openldr_python como API analitica oficial

A nova dashboard deve consumir a API Python como fonte oficial para dados analiticos:

- TB: `/tb/gx/...`
- Viral Load: `/hiv/vl/...`
- DPI/EID: `/hiv/eid/...`
- Dicionarios: `/dict/...`

Qualquer dependencia remanescente do backend Node deve ser tratada como lacuna de API e documentada antes da implementacao.

### openldr-dashboard apenas como fonte de migracao DPI/EID

O `openldr-dashboard` deve orientar a migracao de DPI/EID, mas seus componentes e arquitetura nao devem ser copiados diretamente sem adaptacao. A migracao deve extrair comportamento, metricas e transformacoes, reimplementando a UI sobre `packages/design_system`.

### openldr-frontend apenas como fonte de migracao Viral Load

O `openldr-frontend` deve orientar a migracao de Viral Load. O codigo CRA/React 16 deve ser tratado como legado. A nova implementacao deve usar a stack do monorepo e consumir a API Python por meio de adapters.

### openldr-backend apenas como referencia legada

O `openldr-backend` deve permanecer como referencia para comparacao de endpoints, nomes antigos e comportamento historico. Ele nao deve ser usado como dependencia direta permanente da nova dashboard.

## 4. Nova estrutura proposta dentro do monorepo

Estrutura recomendada:

```txt
openldr-monorepo/
  apps/
    dashboard/
      app/
        (auth)/
          sign-in/
          sign-up/
        (dashboard)/
          layout.tsx
          summary/
            page.tsx
          tb/
            page.tsx
            lab/page.tsx
            clinic/page.tsx
            patients/page.tsx
          viral-load/
            page.tsx
            lab/page.tsx
            clinic/page.tsx
            patients/page.tsx
          dpi/
            page.tsx
            lab/page.tsx
            clinic/page.tsx
            routes/page.tsx
      src/
        features/
          tb/
            api/
            adapters/
            cards/
            types/
            constants/
          viral-load/
            api/
            adapters/
            cards/
            types/
            constants/
          dpi/
            api/
            adapters/
            cards/
            types/
            constants/
        shared/
          api/
            client.ts
            errors.ts
            query-params.ts
          components/
          filters/
          charts/
          exports/
          maps/
          patients/
          types/
  packages/
    design_system/
    auth/
    utilities/
```

Alternativa conservadora: evoluir `apps/tb` para `apps/dashboard` em uma fase posterior. Enquanto a migracao nao iniciar, criar uma nova app `apps/dashboard` evita quebrar a dashboard TB existente.

## 5. Rotas frontend propostas

Rotas principais da dashboard unificada:

| Rota | Dominio | Objetivo |
| --- | --- | --- |
| `/summary` | Geral | Visao consolidada dos dominios TB, Viral Load e DPI/EID |
| `/tb` | TB | Sumario nacional de Tuberculose |
| `/tb/lab` | TB | Relatorios laboratoriais de Tuberculose |
| `/tb/clinic` | TB | Relatorios por provincia/facility de Tuberculose |
| `/tb/patients` | TB | Pesquisa e resultados de pacientes TB |
| `/viral-load` | Viral Load | Sumario nacional de Carga Viral |
| `/viral-load/lab` | Viral Load | Relatorios laboratoriais de Carga Viral |
| `/viral-load/clinic` | Viral Load | Relatorios por provincia/facility de Carga Viral |
| `/viral-load/patients` | Viral Load | Pesquisa e resultados de pacientes Viral Load |
| `/dpi` | DPI/EID | Sumario nacional DPI/EID |
| `/dpi/lab` | DPI/EID | Relatorios laboratoriais DPI/EID |
| `/dpi/clinic` | DPI/EID | Relatorios por provincia/facility DPI/EID |
| `/dpi/routes` | DPI/EID | Rotas de amostras DPI/EID |

Observacao: a rota `/summary` deve ser criada como entrada geral da aplicacao. A rota raiz `/` pode redirecionar para `/summary` depois que a nova app estiver ativa.

## 6. Mapeamento de endpoints legados para endpoints novos

### Tuberculose

TB ja usa a API Python na dashboard atual do monorepo. O mapeamento principal e:

| Area | Card/uso | Endpoint novo |
| --- | --- | --- |
| Summary | Principais indicadores | `/tb/gx/summary/positivity_by_month/` |
| Summary | Resultados em grafico circular | `/tb/gx/summary/positivity_by_month/` |
| Summary | Xpert Ultra | `/tb/gx/summary/positivity_by_month/` |
| Summary | Mapa de positividade | `/tb/gx/facilities/tested_samples/` |
| Summary | Positividade por idade | `/tb/gx/summary/positivity_by_lab_by_age/` |
| Summary | Tipos de amostra por mes | `/tb/gx/summary/sample_types_by_month/` |
| Summary | Status/header cards | `/tb/gx/summary/summary_header_component/` |
| Lab | Amostras registadas por laboratorio | `/tb/gx/laboratories/registered_samples/` |
| Lab | Amostras registadas por mes | `/tb/gx/laboratories/registered_samples_by_month/` |
| Lab | Amostras rejeitadas por laboratorio | `/tb/gx/laboratories/rejected_samples/` |
| Lab | Amostras rejeitadas por mes | `/tb/gx/laboratories/rejected_samples_by_month/` |
| Lab | Rejeitadas por motivo | `/tb/gx/laboratories/rejected_samples_by_reason/` |
| Lab | Rejeitadas por mes e motivo | `/tb/gx/laboratories/rejected_samples_by_reason_by_month/` |
| Clinic | Amostras registadas | `/tb/gx/facilities/registered_samples/` |
| Clinic | Amostras testadas | `/tb/gx/facilities/tested_samples/` |
| Clinic | Testadas por sexo | `/tb/gx/facilities/tested_samples_disaggregated_by_gender/` |
| Clinic | Sensibilidade a medicamentos | `/tb/gx/facilities/tested_samples_disaggregated_by_drug_type/` |
| Clinic | Sensibilidade por idade | `/tb/gx/facilities/tested_samples_disaggregated_by_drug_type_by_age/` |
| Clinic | Rejeitadas | `/tb/gx/facilities/rejected_samples/` |
| Clinic | Rejeitadas por motivo | `/tb/gx/facilities/rejected_samples_by_reason/` |
| Clinic | Tempo de resposta em dias | `/tb/gx/facilities/trl_samples_by_days_tb/` |
| Clinic | TAT medio por provincia | `/tb/gx/facilities/trl_samples_avg_by_days/` |
| Clinic | TAT medio por mes | `/tb/gx/facilities/trl_samples_avg_by_days_by_month/` |
| Patients | Pesquisa por nome | `/tb/gx/patients/by_name/` |
| Patients | Pesquisa por facility | `/tb/gx/patients/by_facility/` |
| Patients | Pesquisa por tipo de amostra | `/tb/gx/patients/by_sample_type/` |
| Patients | Pesquisa por resultado | `/tb/gx/patients/by_result_type/` |

### Viral Load

| Area | Endpoint legado | Endpoint novo |
| --- | --- | --- |
| Summary | `/dash_number_of_samples` | `/hiv/vl/summary/number_of_samples_by_month/` |
| Summary | `/dash_viral_suppression` | `/hiv/vl/summary/viral_suppression_by_month/` |
| Summary | `/dash_tat` | `/hiv/vl/summary/tat_by_month/` |
| Summary | `/dash_map` | `/hiv/vl/summary/suppression_by_province_by_month/` |
| Summary | `/dash_indicators` | `/hiv/vl/summary/header_indicators_by_month/` |
| Summary | `/sampleshistory` | `/hiv/vl/summary/samples_history/` |
| Lab | `/lab_samples_tested_by_month` | `/hiv/vl/laboratories/tested_samples_by_month/` |
| Lab | `/lab_samples_tested_by_lab` | `/hiv/vl/laboratories/tested_samples/` |
| Lab | `/lab_samples_tested_by_gender` | `/hiv/vl/laboratories/tested_samples_by_gender/` |
| Lab | `/lab_samples_tested_by_gender_and_labs` | `/hiv/vl/laboratories/tested_samples_by_gender_by_lab/` |
| Lab | `/lab_samples_tested_by_age` | `/hiv/vl/laboratories/tested_samples_by_age/` |
| Lab | `/lab_samples_by_test_reason` | `/hiv/vl/laboratories/tested_samples_by_test_reason/` |
| Lab | `/lab_samples_tested_pregnant` | `/hiv/vl/laboratories/tested_samples_pregnant/` |
| Lab | `/lab_samples_tested_breastfeeding` | `/hiv/vl/laboratories/tested_samples_breastfeeding/` |
| Lab | `/lab_samples_rejected` | `/hiv/vl/laboratories/rejected_samples/` |
| Lab | `/lab_samples_rejected_by_month` | `/hiv/vl/laboratories/rejected_samples_by_month/` |
| Lab | `/lab_tat` | `/hiv/vl/laboratories/tat_by_lab/` |
| Lab | `/lab_tat_by_month` | `/hiv/vl/laboratories/tat_by_month/` |
| Lab | `/suppression` | `/hiv/vl/laboratories/suppression/` |
| Clinic | `/clinic_registered_samples_by_facility` | `/hiv/vl/facilities/registered_samples/` |
| Clinic | `/clinic_samples_tested_by_month` | `/hiv/vl/facilities/tested_samples_by_month/` |
| Clinic | `/clinic_samples_tested_by_facility` | `/hiv/vl/facilities/tested_samples_by_facility/` |
| Clinic | `/clinic_samples_tested_by_gender` | `/hiv/vl/facilities/tested_samples_by_gender_by_month/` |
| Clinic | `/clinic_samples_tested_by_gender_and_facility` | `/hiv/vl/facilities/tested_samples_by_gender_by_facility/` |
| Clinic | `/clinic_samples_tested_by_age` | `/hiv/vl/facilities/tested_samples_by_age_by_month/` |
| Clinic | `/clinic_samples_tested_by_age_and_facility` | `/hiv/vl/facilities/tested_samples_by_age_by_facility/` |
| Clinic | `/clinic_samples_by_test_reason` | `/hiv/vl/facilities/tested_samples_by_test_reason_by_month/` |
| Clinic | `/clinic_tests_by_pregnancy` | `/hiv/vl/facilities/tested_samples_pregnant/` |
| Clinic | `/clinic_tests_by_breastfeeding` | `/hiv/vl/facilities/tested_samples_breastfeeding/` |
| Clinic | `/clinic_samples_rejected_by_month` | `/hiv/vl/facilities/rejected_samples_by_month/` |
| Clinic | `/clinic_samples_rejected_by_facility` | `/hiv/vl/facilities/rejected_samples_by_facility/` |
| Clinic | `/clinic_tat` | `/hiv/vl/facilities/tat_by_month/` |
| Clinic | `/clinic_tat_by_facility` | `/hiv/vl/facilities/tat_by_facility/` |
| Patients | `/viralload/all_patients/query/:query` | Avaliar substituicao por `/hiv/vl/patients/by_name/`, `/by_facility/`, `/by_result_type/`, `/by_test_reason/` |

Endpoints de weekly reports e backlogs de Viral Load ainda precisam de confirmacao na API Python, pois aparecem no backend Node legado mas nao possuem equivalencia direta identificada.

### DPI/EID

| Area | Endpoint legado | Endpoint novo |
| --- | --- | --- |
| Summary | `/eid/dash/pcr/number_of_samples` | `/hiv/eid/summary/number_of_samples/` |
| Summary | `/eid/dash/poc/number_of_samples` | `/hiv/eid/summary/number_of_samples/` |
| Summary | `/eid/dash/pcr/positivity` | `/hiv/eid/summary/positivity/` |
| Summary | `/eid/dash/poc/positivity` | `/hiv/eid/summary/positivity/` |
| Summary | `/eid/dash/pcr/indicators` | `/hiv/eid/summary/indicators/` |
| Summary | `/eid/dash/poc/indicators` | `/hiv/eid/summary/indicators/` |
| Summary | `/eid/dash/pcr/tat` | `/hiv/eid/summary/tat/` |
| Summary | `/eid/dash/pcr/tat_samples` | `/hiv/eid/summary/tat_samples/` |
| Summary | `/eid/dash/indicators_by_province` | `/hiv/eid/summary/indicators_by_province/` |
| Summary | `/eid/dash/samples_positivity` | `/hiv/eid/summary/samples_positivity/` |
| Summary | `/eid/dash/rejected_samples_monthly` | `/hiv/eid/summary/rejected_samples_by_month/` |
| Summary | `/eid/dash/samples_by_equipment` | `/hiv/eid/summary/samples_by_equipment/` |
| Summary | `/eid/dash/samples_by_equipment_monthly` | `/hiv/eid/summary/samples_by_equipment_by_month/` |
| Lab | `/eid/lab/all/samples_tested_by_month` | `/hiv/eid/laboratories/tested_samples_by_month/` |
| Lab | `/eid/lab/all/samples_registered_by_month` | `/hiv/eid/laboratories/registered_samples_by_month/` |
| Lab | `/eid/lab/conventional/samples_tested` | `/hiv/eid/laboratories/tested_samples/` |
| Lab | `/eid/lab/poc/samples_tested` | `/hiv/eid/laboratories/tested_samples/` |
| Lab | `/eid/lab/conventional/tat` | `/hiv/eid/laboratories/tat/` |
| Lab | `/eid/lab/poc/tat` | `/hiv/eid/laboratories/tat/` |
| Lab | `/eid/lab/tat_samples` | `/hiv/eid/laboratories/tat_samples/` |
| Lab | `/eid/lab/rejected_samples` | `/hiv/eid/laboratories/rejected_samples/` |
| Lab | `/eid/lab/rejected_samples_monthly` | `/hiv/eid/laboratories/rejected_samples_by_month/` |
| Lab | `/eid/lab/samples_by_equipment` | `/hiv/eid/laboratories/samples_by_equipment/` |
| Lab | `/eid/lab/samples_by_equipment_monthly` | `/hiv/eid/laboratories/samples_by_equipment_by_month/` |
| Routes | `/eid/lab/sample_routes` | `/hiv/eid/laboratories/sample_routes/` |
| Routes | `/eid/lab/sample_routes_viewport` | `/hiv/eid/laboratories/sample_routes_viewport/` |
| Clinic | `/eid/clinic/samples_registered_province` | `/hiv/eid/facilities/registered_samples/` |
| Clinic | `/eid/clinic/samples_registered_month` | `/hiv/eid/facilities/registered_samples_by_month/` |
| Clinic | `/eid/clinic/samples_tested_province` | `/hiv/eid/facilities/tested_samples/` |
| Clinic | `/eid/clinic/samples_tested_month` | `/hiv/eid/facilities/tested_samples_by_month/` |
| Clinic | `/eid/clinic/samples_tested_gender_province` | `/hiv/eid/facilities/tested_samples_by_gender/` |
| Clinic | `/eid/clinic/samples_tested_gender_month` | `/hiv/eid/facilities/tested_samples_by_gender_by_month/` |
| Clinic | `/eid/clinic/samples_tat_avg_month` | `/hiv/eid/facilities/tat_avg_by_month/` |
| Clinic | `/eid/clinic/samples_tat_avg_province` | `/hiv/eid/facilities/tat_avg/` |
| Clinic | `/eid/clinic/samples_tat_days_month` | `/hiv/eid/facilities/tat_days_by_month/` |
| Clinic | `/eid/clinic/samples_tat_days_province` | `/hiv/eid/facilities/tat_days/` |
| Clinic | `/eid/clinic/samples_rejected_by_month` | `/hiv/eid/facilities/rejected_samples_by_month/` |
| Clinic | `/eid/clinic/samples_rejected_by_facility` | `/hiv/eid/facilities/rejected_samples/` |
| Clinic | `/eid/clinic/conventional/key_indicators` | `/hiv/eid/facilities/key_indicators/` |
| Clinic | `/eid/clinic/poc/key_indicators` | `/hiv/eid/facilities/key_indicators/` |
| Patients | `/eid/patient/find-all` | Lacuna a confirmar na API Python |

## 7. Estrategia de adapters por dominio

Os adapters devem separar a UI dos detalhes de endpoint, parametros e shape de resposta. Cada card deve consumir funcoes de dominio, nao endpoints diretamente.

### `features/tb/api`

Objetivo:

- manter o consumo atual da API Python;
- normalizar chamadas dispersas em actions locais;
- padronizar filtros como `interval_dates`, tipo de teste, provincia, distrito, laboratorio e facility;
- expor tipos compartilhados por card.

Exemplo de responsabilidades:

- `getTbSummaryIndicators(params)`
- `getTbLabRejectedSamples(params)`
- `getTbClinicTestedSamples(params)`
- `searchTbPatients(params)`

### `features/viral-load/api`

Objetivo:

- substituir endpoints legados `/dash_*`, `/lab_*`, `/clinic_*` por `/hiv/vl/...`;
- adaptar nomes antigos usados pelos cards para contratos novos;
- centralizar diferencas de formato entre backend Node e API Python;
- tratar lacunas de patients/raw export sem espalhar condicionais pela UI.

Exemplo de responsabilidades:

- `getViralLoadSummary(params)`
- `getViralLoadSuppression(params)`
- `getViralLoadLabTat(params)`
- `getViralLoadClinicRejectedSamples(params)`
- `searchViralLoadPatients(params)`

### `features/dpi/api`

Objetivo:

- substituir endpoints `/eid/dash/*`, `/eid/lab/*`, `/eid/clinic/*` por `/hiv/eid/...`;
- encapsular filtros PCR/POC/conventional;
- normalizar responses para cards de summary, lab, clinic e routes;
- documentar lacunas como patients EID.

Exemplo de responsabilidades:

- `getDpiSummaryIndicators(params)`
- `getDpiLabTestedSamples(params)`
- `getDpiClinicTat(params)`
- `getDpiSampleRoutes(params)`
- `searchDpiPatients(params)` quando houver contrato oficial.

## 8. Riscos tecnicos e mitigacao

| Risco | Impacto | Mitigacao |
| --- | --- | --- |
| Payloads da API Python diferentes dos payloads legados | Cards podem mostrar metricas incorretas | Criar fixtures comparativas e validar card a card antes de trocar endpoint |
| Endpoints sem equivalente direto na API nova | Bloqueio de migracao de alguns cards | Registrar lacunas, priorizar implementacao na API Python ou criar fallback temporario documentado |
| Divergencia de autenticacao entre apps | Inconsistencia de sessao e autorizacao | Definir auth unica na nova app antes de migrar dados sensiveis |
| Mistura de bibliotecas de graficos | Alto custo de manutencao | Padronizar novos cards sobre componentes do design system e manter adapters de dados independentes da biblioteca |
| Design systems duplicados | UI inconsistente | Usar apenas `packages/design_system` na nova app |
| Migracao direta de componentes legados | Importacao de dependencias antigas e acoplamento | Migrar comportamento e transformacoes, nao copiar arquitetura dos repositorios antigos |
| Parametros de filtros inconsistentes | Dados divergentes por periodo/local | Criar modelo unico de filtros por dominio e funcoes de serializacao para a API |
| Exportacoes Excel/imagem com regressao | Perda de funcionalidades usadas por usuarios | Implementar utilitarios compartilhados em `shared/exports` e testar por card |
| Drill-down de pacientes incompleto | Perda de investigacao operacional | Mapear cada drill-down para endpoint oficial antes da migracao do card |
| Regressao em mapas e rotas | Visualizacoes geograficas podem quebrar | Migrar mapas numa fase propria, validando coordenadas, bounds e performance |

## 9. Plano incremental de migracao por fases

### Fase 0: Preparacao e contratos

- Confirmar a app alvo: nova `apps/dashboard` ou evolucao controlada de `apps/tb`.
- Definir variaveis de ambiente para API oficial.
- Definir estrategia de autenticacao.
- Criar inventario final de cards, filtros, payloads e exportacoes.
- Criar matriz de lacunas entre backend Node e API Python.

### Fase 1: Fundacao da app unificada

- Criar shell da aplicacao com `DashboardLayout` do design system.
- Implementar navegacao principal para `/summary`, `/tb`, `/viral-load` e `/dpi`.
- Criar cliente HTTP compartilhado.
- Criar modelos base de filtros: periodo, provincia, distrito, facility, laboratorio e tipo de teste.
- Criar estrutura `features/*/api`, `features/*/cards` e `shared/*`.

### Fase 2: Consolidacao de TB

- Migrar ou reorganizar a dashboard TB existente para a nova estrutura.
- Preservar endpoints atuais da API Python.
- Remover chamadas diretas dispersas dos cards em favor de `features/tb/api`.
- Validar cards de summary, clinic, lab e patients.

### Fase 3: Migracao de Viral Load

- Migrar primeiro `/viral-load` summary.
- Migrar `/viral-load/lab` por grupos: samples, TAT, rejected, demographics.
- Migrar `/viral-load/clinic` por grupos equivalentes.
- Migrar `/viral-load/patients` apos confirmar contrato de patients na API Python.
- Comparar resultados com `openldr-frontend` e `openldr-backend`.

### Fase 4: Migracao de DPI/EID

- Migrar primeiro `/dpi` summary.
- Migrar `/dpi/lab` com suporte a PCR/POC/conventional.
- Migrar `/dpi/clinic`.
- Migrar `/dpi/routes` com mapas e rotas de amostras.
- Tratar `/dpi/patients` apenas se houver endpoint oficial ou decisao de escopo.

### Fase 5: Padronizacao visual e operacional

- Uniformizar cards, headers, filtros, empty states, loading states e error states.
- Padronizar exportacao Excel/imagem.
- Padronizar dialogs de documentacao, sugestoes e drill-down.
- Revisar responsividade e acessibilidade.

### Fase 6: Validacao e desativacao gradual do legado

- Validar metricas por periodo e dominio contra as dashboards antigas.
- Criar testes de adapters e transformacoes criticas.
- Documentar endpoints sem equivalencia e decisoes tomadas.
- Planejar desativacao dos frontends antigos apenas apos homologacao funcional.

