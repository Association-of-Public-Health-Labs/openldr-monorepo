# Diretrizes de UI da Dashboard Unificada

## Decisão visual

A nova app `apps/dashboard` deve seguir o design system existente e o padrão visual
da dashboard de Tuberculose em `apps/tb`. O `DashboardLayout`, o `AppProvider`,
os temas compatíveis com TB e o `MainCard` são as referências base para a
experiência unificada.

## Filtros

Não haverá filtros globais nesta fase. Cada relatório deve gerir o seu próprio
contexto dentro do card, seguindo o padrão já usado nos relatórios de TB.

Filtros de período, laboratório, província, distrito, unidade sanitária,
exportação e documentação devem ser implementados dentro de cada `MainCard`,
quando o relatório real for migrado.

## Cards

O `MainCard` é o padrão base para relatórios. Mesmo os placeholders devem parecer
relatórios reais em construção, com:

- título específico do relatório;
- subtítulo contextual ou período exemplo;
- corpo central preparado para visualização futura;
- ações do card preservadas pelo design system;
- espaço para documentação e exportação futura.

## Referência para migração

Os cards existentes de TB são a referência para a migração futura de Viral Load
e DPI/EID. VL e DPI devem herdar a mesma estrutura visual antes de receberem
adapters, chamadas de API e dados reais.

## Piloto de migração — Tuberculose Sumário

A rota `/tb` foi escolhida como piloto porque já representa a entrada real da
dashboard de Tuberculose e concentra cards nacionais, gráficos, mapa, abas
Ultra/XDR, exportação e documentação. Isso permite validar a compatibilidade da
nova app com os padrões reais da TB antes de migrar VL e DPI.

Cards reutilizados a partir de `apps/tb/app/(dashboard)/(index)`:

- `OverviewStatusCards`;
- `MTBXpertPieChartReport`;
- `MTBXpertMapReport`;
- `MTBXpertUltra`;
- `MTBXpertByAge`;
- `MTBXpertBySpecimenType`;
- `MTBRejectedSamplesByMonthAndReason`;
- `KeyIndicatorsReport`.

Dependências identificadas:

- `NEXT_PUBLIC_OPENLDR_API` continua a ser usado pelos cards reais;
- Clerk é necessário para `useAuth`, `useUser` e obtenção de token;
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` deve estar configurado para carregar o
  piloto real autenticado;
- alguns cards usam o contexto de AI chat existente em `@repo/ai`;
- exportação e gráficos dependem de `xlsx`, `html2canvas`, `react-icons`,
  Apex/Chart.js e componentes do design system.

Problemas corrigidos nesta fase:

- o provedor Clerk ficou isolado no piloto `/tb`, evitando bloquear as rotas
  placeholder quando a chave pública ainda não estiver configurada;
- o contexto de AI chat ficou restrito a um runtime client-only, evitando erros
  de prerender associados a APIs de browser;
- o modo escuro da nova app passou a usar temas compatíveis com a dashboard TB;
- o layout global mantém navegação, header e fundo consistentes sem introduzir
  filtros globais.

Pendências:

- Tuberculose está disponível na app unificada nas rotas `/tb`, `/tb/lab`,
  `/tb/clinic` e `/tb/patients`;
- Carga Viral continua em fase placeholder e DPI segue com piloto real apenas em
  `/dpi`;
- após validação do piloto, os cards de TB podem ser extraídos para
  `apps/dashboard/features/tb/cards` para reduzir acoplamento ao diretório
  `apps/tb`.

## Migração — Tuberculose Laboratório

A rota `/tb/lab` passa a reutilizar a página laboratorial real de
`apps/tb/app/(dashboard)/lab`, mantendo a grelha responsiva original e o
contexto próprio de cada relatório. Esta migração valida relatórios com
drill-down para pacientes, filtros internos, tabs Ultra/XDR, exportação e
documentação.

Cards reutilizados:

- `MTBRegisteredByLab`;
- `MTBRegisteredByMonth`;
- `MTBRejectedSamplesByLab`;
- `MTBRejectedSamplesByMonth`;
- `MTBRejectedSamplesByLabAndReason`;
- `MTBRejectedSamplesByMonthAndReason`.

Endpoints usados pelos relatórios laboratoriais:

- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/registered_samples/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/registered_samples_by_month/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/rejected_samples/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/rejected_samples_by_month/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/rejected_samples_by_reason/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/rejected_samples_by_reason_by_month/`;
- `${NEXT_PUBLIC_OPENLDR_API}/dict/facilities/province/districts/`, usado por
  filtros/drill-down de alguns relatórios.

Dependências encontradas:

- `useAuth` e `useUser` do Clerk para token e contexto do utilizador;
- `config/api` da app TB para chamadas autenticadas com Bearer token;
- `MainCard`, `Stacked`, tabs locais da TB e `PatientsDataDialog`;
- `xlsx`, `html2canvas`, `react-icons` e utilitários locais de exportação;
- `actions.ts`, `constants.ts`, `docs.tsx`, `excel-export-utils.ts` e
  `chart-export-utils.ts` nos diretórios de cada relatório.

Pendências:

- validar a experiência completa em runtime com autenticação e API reais;
- avaliar extração posterior dos cards para `apps/dashboard/features/tb/lab`
  depois da validação funcional;
- concluir validação funcional do módulo TB completo em ambiente autenticado;
- manter Carga Viral e as subrotas de DPI como placeholders até as fases
  correspondentes.

## Migração — Tuberculose Província / Distrito / US

A rota `/tb/clinic` passa a reutilizar a página real de
`apps/tb/app/(dashboard)/clinic`. A migração preserva a análise por província,
distrito e unidade sanitária, com filtros internos por relatório, tabs Ultra/XDR,
menus de ação, exportação, documentação e abertura de pacientes quando o card já
suporta esse comportamento.

Cards reutilizados:

- `MTBRegisteredByFacility`;
- `MTBTestedByFacility`;
- `MTBTestedSamplesDisaggregatedByGender`;
- `MTBResponseTimeInDays`;
- `MTBTestedSamplesDisaggregatedByDrug`;
- `MTBTestedSamplesDisaggregatedByDrugAndAge`;
- `MTBRejectedSamples`;
- `MTBRejectedSamplesByReason`;
- `MTBTurnaroundTimeByMonth`;
- `MTBTurnaroundTimeByFacility`.

Endpoints usados pelos relatórios de província/distrito/US:

- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/registered_samples/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples_disaggregated_by_gender/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples_disaggregated_by_drug_type/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/tested_samples_disaggregated_by_drug_type_by_age/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/rejected_samples/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/rejected_samples_by_reason/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/trl_samples_by_days_tb/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/trl_samples_avg_by_days_by_month/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/trl_samples_avg_by_days/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/facilities/patients/`, usado por alguns
  fluxos de drill-down para pacientes.

Dependências de drill-down:

- os cards mantêm `facilityType` interno e seguem a hierarquia
  `province → district → clinic`;
- ao clicar no nível de unidade sanitária, os relatórios que já suportam
  pacientes abrem `PatientsDataDialog`;
- as chamadas continuam a usar `useAuth`, `useUser`, `config/api` e Bearer token;
- os parâmetros de província, distrito, unidade sanitária, período e tipo de
  resultado continuam encapsulados nos `actions.ts` dos cards.

Pendências:

- validar o drill-down completo em browser com autenticação e API reais;
- avaliar extração gradual dos cards para `apps/dashboard/features/tb/clinic`
  após confirmação funcional;
- concluir validação funcional do módulo TB completo em ambiente autenticado;
- manter Carga Viral e as subrotas de DPI como placeholders até as respectivas
  fases de migração.

## Migração — Tuberculose Pacientes

A rota `/tb/patients` passa a reutilizar a página real de
`apps/tb/app/(dashboard)/patients`. Esta fase fecha a disponibilidade funcional
do módulo de Tuberculose dentro da app unificada, preservando pesquisa
autenticada, filtros internos, tabela avançada, paginação server-side, exportação
para Excel e estados de erro/vazio/carregamento.

Métodos de pesquisa migrados:

- pesquisa por unidade sanitária;
- pesquisa por primeiro nome e/ou apelido;
- pesquisa por tipo de amostra;
- pesquisa por tipo de resultado;
- filtro complementar por tipo de GeneXpert (`Todos`, `Ultra 6 Cores` e
  `XDR 10 Cores`).

Endpoints usados:

- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_facility/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_name/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_sample_type/`;
- `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/patients/by_result_type/`.

Dependências de autenticação e permissão:

- a página usa `useAuth` para obter Bearer token e `useUser` para contexto do
  utilizador no `MainCard`;
- a regra de permissão não foi alterada: respostas de erro da API com código
  `403` continuam a ser apresentadas como acesso restrito a utilizadores com
  permissão de Administrador;
- a paginação e os filtros são enviados aos endpoints existentes sem alterar
  contratos.

Pendências:

- validar pesquisa, paginação e exportação em browser com autenticação e API
  reais;
- avaliar extração posterior dos componentes de pacientes para
  `apps/dashboard/features/tb/patients`;
- iniciar a próxima fase com Carga Viral mantendo `/dpi/lab`, `/dpi/clinic` e
  `/dpi/routes` como placeholders.

## Migração — DPI Sumário

A rota `/dpi` passa a usar uma implementação piloto real dentro de
`apps/dashboard`, tomando `openldr-dashboard/pages/index.tsx` apenas como fonte
funcional. A nova implementação não copia o design system antigo, não usa Auth0
e não usa Pages Router. Os cards foram recriados com `MainCard`, gráficos do
design system do monorepo e adapters para a API Python nova.

Cards migrados nesta fase:

- indicadores principais de DPI;
- número de amostras por mês;
- positividade por mês;
- positividade por sexo;
- indicadores por província;
- TAT convencional por mês;
- amostras por faixa de TAT;
- amostras rejeitadas por mês;
- amostras por equipamento.

Endpoints novos usados:

- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/indicators/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/number_of_samples/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/positivity/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/indicators_by_province/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/samples_positivity/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/tat/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/tat_samples/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/rejected_samples_by_month/`;
- `${NEXT_PUBLIC_OPENLDR_API}/hiv/eid/summary/samples_by_equipment_by_month/`.

Endpoints legados substituídos:

- `/eid/dash/pcr/number_of_samples` por `/hiv/eid/summary/number_of_samples/`;
- `/eid/dash/pcr/positivity` por `/hiv/eid/summary/positivity/`;
- `/eid/dash/pcr/indicators` e `/eid/dash/poc/indicators` por
  `/hiv/eid/summary/indicators/` com `lab_type`;
- `/eid/dash/pcr/tat` por `/hiv/eid/summary/tat/`;
- `/eid/dash/pcr/tat_samples` por `/hiv/eid/summary/tat_samples/`;
- `/eid/dash/indicators_by_province` por
  `/hiv/eid/summary/indicators_by_province/`;
- `/eid/dash/samples_positivity` por `/hiv/eid/summary/samples_positivity/`;
- `/eid/dash/rejected_samples_monthly` por
  `/hiv/eid/summary/rejected_samples_by_month/`;
- `/eid/dash/samples_by_equipment_monthly` por
  `/hiv/eid/summary/samples_by_equipment_by_month/`.

Diferenças de payload encontradas:

- a API Python usa nomes em `snake_case`, como `month_name`, `registered`,
  `tested`, `rejected`, `positive` e `negative`, enquanto o dashboard legado
  usava nomes como `MonthName`, `Registados`, `Testados` e `Rejeitados`;
- os endpoints PCR/POC foram consolidados e passam a usar o filtro `lab_type`;
- `samples_positivity` devolve um objeto agregado, não uma série mensal;
- `tat_samples` devolve faixas `less_7`, `between_7_14`,
  `between_15_21` e `greater_21`, diferentes das chaves legadas `<7`,
  `7-15`, `16-21` e `>21`;
- `indicators_by_province` expõe campos detalhados para convencional/POC, como
  `total_conventional` e `total_poc`, além de positivos/negativos por tipo.

Pendências:

- validar os cards em runtime com `NEXT_PUBLIC_OPENLDR_API` apontado para a API
  Python nova;
- confirmar se os endpoints exigem Bearer token no ambiente alvo e, se
  necessário, ligar a obtenção de token sem Auth0;
- migrar `/dpi/lab`, `/dpi/clinic` e `/dpi/routes` em fases separadas;
- adicionar exportação/documentação específica por card depois da validação dos
  payloads reais.
