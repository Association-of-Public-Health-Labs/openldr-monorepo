# Diretrizes de UI da Dashboard Unificada

## Decisão visual

A nova app `apps/dashboard` deve seguir o design system existente e o padrão visual
da dashboard de Tuberculose em `apps/tb`. O `DashboardLayout`, o `AppProvider`,
os temas compatíveis com TB e o `MainCard` são as referências base para a
experiência unificada.

## Padrão global de período dos relatórios

Todos os relatórios da dashboard unificada devem usar a mesma regra padrão de
período:

- data final: a data corrente;
- data inicial: a mesma data do ano anterior, ou seja, hoje menos 12 meses;
- o dia do mês deve ser preservado sempre que possível;
- em casos como 29 de Fevereiro, a data inicial deve ser ajustada para o último
  dia válido do mês correspondente.

O helper central fica em:

- `apps/dashboard/features/shared/reporting/dateRange.ts`.

Funções principais:

- `getDefaultReportDateRange()`;
- `getDefaultReportDateInterval()`;
- `formatReportIntervalDates()`;
- `formatReportDateRangeLabel()`;
- `formatReportDisplayDate()`.

Formato para API:

- usar sempre `interval_dates=startDateIso,endDateIso`;
- exemplo: `interval_dates=2025-07-01,2026-07-01`;
- não alterar o nome do parâmetro quando o endpoint já espera
  `interval_dates`.

Formato para UI:

- usar `De DD de Mês de YYYY a DD de Mês de YYYY`;
- exemplo: `De 01 de Julho de 2025 a 01 de Julho de 2026`;
- evitar usar `Últimos 12 meses` como substituto do período oficial.

Orientação para novos cards:

- não usar datas hardcoded;
- não calcular `new Date()`, `setMonth`, `setFullYear` ou `interval_dates`
  diretamente dentro dos cards;
- obter o intervalo padrão através do helper central ou de wrappers de módulo
  que deleguem para ele;
- manter descrições como `Amostras testadas no período selecionado` apenas como
  texto secundário, nunca como regra paralela de período.

## Fase A — Shell unificada baseada na dashboard TB

A shell customizada de `apps/dashboard` foi descontinuada em favor da arquitetura
usada por `apps/tb`. A app unificada passa a herdar o mesmo padrão de providers,
tema, settings, autenticação e layout visual da dashboard de Tuberculose.

`UnifiedDashboardLayout` foi descontinuado porque recriava manualmente a estrutura
da aplicação com `height: 100vh`, `overflow: hidden`, header próprio, padding
divergente e `AppProvider` de `@repo/design_system_mui`. Esses detalhes criavam
um ambiente diferente do usado pelos cards reais de TB e podiam cortar conteúdo,
ocultar overflow horizontal e alterar o comportamento esperado dos relatórios.

`SidebarNavigation` também foi descontinuada porque implementava uma sidebar
paralela, incluindo botão manual de expandir/retrair e estado próprio de grupos.
A renderização da navegação deve vir do `DashboardLayout` oficial do design
system, como acontece na app TB.

Arquivos da TB usados como referência:

- `apps/tb/app/layout.tsx`;
- `apps/tb/app/(dashboard)/layout.tsx`;
- `apps/tb/hooks/useLayoutSettings.ts`;
- `apps/tb/context/theme-provider.tsx`;
- `apps/tb/themes/light.ts`;
- `apps/tb/themes/dark.ts`;
- `apps/tb/middleware.ts`;
- `apps/tb/config/api.ts`;
- `apps/tb/tailwind.config.ts`;
- `apps/tb/app/globals.css`.

Na `apps/dashboard`, o root layout agora usa `ThemeProvider` de `next-themes` e
`ClerkProvider` global. O grupo `(dashboard)` usa `AppProvider` de
`@repo/design_system`, `AIChatProvider` e `DashboardLayout` oficial. As páginas
TB deixam de criar `ClerkProvider` próprio e passam a herdar a autenticação da
shell.

Limitação conhecida: o `DashboardLayout` oficial aceita uma lista plana de
opções e não suporta submenus aninhados para módulos. Nesta fase, a dashboard
unificada usa a estrutura mais próxima suportada pelo design system, com entradas
planas para Sumário Geral, TB, Carga Viral e DPI. Uma melhoria posterior deve
avaliar suporte oficial a grupos dentro do próprio design system, sem reintroduzir
uma sidebar customizada em `apps/dashboard`.

Próximos passos imediatos:

- validar `/summary` dentro da nova shell;
- revalidar `/tb` com a página real da dashboard TB;
- só depois avançar para a validação controlada de `/tb/lab`, `/tb/clinic` e
  `/tb/patients`;
- manter Carga Viral e DPI fora do escopo de migração desta fase.

## Fase B — Autenticação e piloto /tb

As rotas `/sign-in` e `/sign-up` da `apps/dashboard` passam a usar formulários
funcionais com hooks do Clerk, seguindo a abordagem customizada da `apps/tb` em
vez de páginas estáticas. O fluxo usa `useSignIn`, `useSignUp`, `useAuth`,
`setActive` e redireciona utilizadores autenticados para `/summary`.

O `ClerkProvider` permanece apenas no root layout da `apps/dashboard`. Os
runtimes de TB dentro da app unificada não criam providers próprios, evitando
duplicação de sessão e inconsistência de tokens nos cards reais.

Comportamento do middleware:

- `/sign-in` e `/sign-up` são públicos;
- `/summary`, `/tb` e demais rotas internas exigem autenticação;
- uma sessão ausente redireciona para `/sign-in`;
- após autenticação, `/summary` e `/tb` ficam acessíveis dentro da shell oficial.

Variáveis necessárias:

- `NEXT_PUBLIC_OPENLDR_API`;
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`;
- `CLERK_SECRET_KEY`;
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`;
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`.

Como testar localmente:

- iniciar `pnpm --filter dashboard dev`;
- abrir `http://localhost:3000/sign-in`;
- sem sessão, abrir `http://localhost:3000/summary` e confirmar redirect para
  `/sign-in`;
- autenticar e confirmar que `/summary` abre dentro do `DashboardLayout`;
- abrir `http://localhost:3000/tb` e confirmar que os cards reais do sumário de
  TB são renderizados na shell unificada.

O piloto `/tb` reutiliza a página real de
`apps/tb/app/(dashboard)/(index)/page` dentro da shell da `apps/dashboard`,
sem duplicar sidebar, header ou layout. Os cards esperados são:

- indicadores principais;
- positividade/mapa nacional;
- distribuição Ultra/XDR;
- distribuição por faixa etária;
- tipo de espécime;
- rejeições por mês e motivo;
- tabela de indicadores principais, quando disponível no sumário original.

Permanecem fora do escopo desta fase:

- migração ou revisão de `/tb/lab`;
- migração ou revisão de `/tb/clinic`;
- migração ou revisão de `/tb/patients`;
- Carga Viral;
- DPI;
- filtros globais.

## Fase C — Consolidação completa de Tuberculose

A consolidação de Tuberculose mantém a shell oficial da `apps/dashboard` e
passa a renderizar as quatro páginas reais da `apps/tb` dentro dessa shell:
`/tb`, `/tb/lab`, `/tb/clinic` e `/tb/patients`. Nenhuma dessas rotas deve
duplicar header, sidebar ou `DashboardLayout`.

O problema de estilo dos cards TB na `apps/dashboard` estava na pipeline
Tailwind/PostCSS. A app unificada tinha `globals.css` com fontes externas, mas
não tinha `postcss.config.mjs` próprio com `@tailwindcss/postcss`, e a config
Tailwind não era carregada explicitamente pelo CSS global. Como resultado, o
CSS compilado não incluía utilitários usados pelos componentes reais de TB,
incluindo cards arredondados/coloridos, tabs Radix/shadcn, inputs, selects,
tables e tokens como `bg-muted` e `text-muted-foreground`.

Alinhamento aplicado:

- `apps/dashboard/postcss.config.mjs` usa a mesma pipeline de Tailwind v4 da
  `apps/tb`;
- `apps/dashboard/app/globals.css` carrega explicitamente
  `../tailwind.config.ts`;
- `apps/dashboard/tailwind.config.ts` inclui sources de `apps/tb`, dos
  componentes locais da dashboard e dos pacotes `design_system`,
  `design_system_mui`, `ai` e `auth`;
- os estilos globais continuam estruturais, sem CSS pontual por card.

Páginas TB consolidadas:

- `/tb` reutiliza o sumário real de `apps/tb/app/(dashboard)/(index)/page`;
- `/tb/lab` reutiliza a página real de laboratório de
  `apps/tb/app/(dashboard)/lab/page`;
- `/tb/clinic` reutiliza a página real de província/distrito/US de
  `apps/tb/app/(dashboard)/clinic/page`;
- `/tb/patients` reutiliza a página real de pacientes de
  `apps/tb/app/(dashboard)/patients/page`.

Cards esperados por rota:

- `/tb`: indicadores principais, Ultra/XDR, mapa/positividade nacional,
  amostras por mês, faixa etária, tipo de espécime, rejeições e tabela de
  indicadores;
- `/tb/lab`: amostras registadas por laboratório/mês e rejeições por
  laboratório, mês e motivo;
- `/tb/clinic`: amostras registadas/testadas, sexo, droga, droga por idade,
  rejeições, TAT e drill-down geográfico quando disponível na página original;
- `/tb/patients`: `MainCard`, tabs, input, select, botão de pesquisa, estados
  vazios/carregamento/erro e tabela/lista de resultados.

Navegação:

- a sidebar continua a ser fornecida pelo `DashboardLayout` oficial;
- não há `UnifiedDashboardLayout`, `SidebarNavigation` customizada nem botão de
  expandir/retrair dentro da lista;
- como o layout oficial ainda aceita opções planas, a percepção por programa é
  feita por ordem, labels e ícones consistentes: Sumário Geral, TB, CV e DPI.

Permanecem fora do escopo desta fase:

- qualquer migração real adicional de Carga Viral;
- qualquer migração real adicional de DPI;
- filtros globais;
- alteração de endpoints ou da API Python.

## Fase D — Navegação expansível e revisão de escopo

A navegação da `apps/dashboard` passa a usar uma árvore de módulos em vez de uma
lista plana extensa. A shell continua a ser o `DashboardLayout` oficial do
design system; não há retorno ao `UnifiedDashboardLayout`, não há
`SidebarNavigation` customizada dentro da app e não há MUI Drawer paralelo.

Estrutura do menu:

- Sumário Geral;
- Tuberculose:
  - Sumário;
  - Província;
  - Pacientes;
- Carga Viral:
  - Sumário;
  - Laboratório;
  - Província;
  - Pacientes;
- DPI:
  - Sumário;
  - Laboratório;
  - Província.

Revisão de escopo:

- `TB Laboratório` foi removido da navegação da dashboard unificada. A rota
  `/tb/lab` pode continuar existente no código, mas fica fora do escopo
  funcional atual e sem link no menu;
- `DPI Rotas` foi removido da navegação. A rota `/dpi/routes` pode continuar
  existente no código, mas fica fora do escopo funcional atual e sem link no
  menu;
- `/summary` reflete o mesmo escopo: Tuberculose mostra Sumário, Província e
  Pacientes; DPI mostra Sumário, Laboratório e Província.

Comportamento esperado em modo expandido:

- os módulos principais ficam visíveis como Sumário Geral, Tuberculose, Carga
  Viral e DPI;
- Tuberculose, Carga Viral e DPI podem ser expandidos/recolhidos;
- o grupo da rota ativa abre automaticamente;
- o item interno ativo fica destacado;
- os labels usam nomes amigáveis, sem abreviações como `TB Lab` ou `DPI Rotas`.

Comportamento esperado em modo compacto:

- a sidebar mostra apenas os ícones dos módulos principais;
- os labels ficam disponíveis por tooltip;
- clicar num módulo navega para a sua rota principal;
- o módulo ativo permanece destacado.

Compatibilidade:

- o suporte a `children` foi adicionado de forma opcional ao componente de
  navegação do design system;
- a API antiga de `options` plana continua válida, mantendo a compatibilidade
  com `apps/tb`;
- a alteração não migra Carga Viral nem DPI, apenas prepara navegação e escopo.

## Fase E1 — Carga Viral Sumário

A rota `/viral-load` deixa de ser placeholder e passa a renderizar o primeiro
conjunto real de cards de Carga Viral dentro da shell oficial da
`apps/dashboard`. A implementação usa `MainCard`, `NEXT_PUBLIC_OPENLDR_API`,
token Clerk por `getToken` e endpoints da API Python. O backend Node legado e a
shell do `openldr-frontend` nao sao contratos desta fase.

Cards implementados:

- indicadores principais de Carga Viral;
- supressao viral por mes;
- tempo de resposta por mes;
- supressao por provincia;
- histórico de amostras.

Endpoints usados:

- `/hiv/vl/summary/header_indicators_by_month/`;
- `/hiv/vl/summary/number_of_samples_by_month/`;
- `/hiv/vl/summary/viral_suppression_by_month/`;
- `/hiv/vl/summary/tat_by_month/`;
- `/hiv/vl/summary/suppression_by_province_by_month/`;
- `/hiv/vl/summary/samples_history/`.

Adapters criados:

- adapters de sumario para normalizar `registered`, `tested`, `suppressed`,
  `not_suppressed`, `rejected`, TAT segmentado e agregados por provincia;
- adapters de charts para transformar as series normalizadas em datasets
  compatíveis com Chart.js do design system;
- normalização de percentuais, valores nulos, meses e nomes de províncias.

Diferenças de payload encontradas:

- a API Python usa `snake_case`, como `not_suppressed`, `month_name`,
  `collection_reception` e `analysis_validation`;
- os cards antigos esperavam campos como `non_suppressed`, `facility`, `lab` e
  series calculadas no frontend;
- a taxa de supressão e o TAT médio são calculados nos adapters da dashboard;
- `samples_history` fornece volume histórico, enquanto rejeições/pendentes
  completos ainda dependem de dados complementares.

Relatorios pendentes:

- `TATvsDisa` nao foi migrado porque nao ha endpoint equivalente identificado
  em `api_openldr_python/hiv/vl`;
- weekly reports de laboratorio ficam fora desta fase;
- `/viral-load/lab`, `/viral-load/clinic` e `/viral-load/patients` continuam
  placeholders;
- export raw, pacientes e drill-down geografico avancado ficam para fases
  posteriores.

Proximo passo recomendado:

- implementar `/viral-load/clinic` reutilizando os endpoints de
  `/hiv/vl/facilities/*`, com adapters para provincia, distrito e unidade
  sanitária, mantendo filtros internos por card e sem filtros globais.

## Fase E1.1 — Refinamento de Carga Viral Sumário

A rota `/viral-load` foi refinada visualmente e funcionalmente antes de avançar
para Província, Laboratório ou Pacientes. O objetivo desta fase é estabilizar o
sumário, corrigir a responsividade e garantir que os cards mostram dados reais
ou estados vazios/erro dentro do próprio card.

Problemas corrigidos:

- os cards superiores deixaram de ficar comprimidos numa única linha e passam a
  usar uma grelha responsiva: três cards em desktop, dois em tablet e um em
  mobile;
- labels visíveis foram padronizados em português: Supressão, Mês, Província,
  Não suprimidos, TAT médio e Rejeições;
- os cards de relatório tiveram alturas menores e mais consistentes para evitar
  grandes áreas vazias;
- o intervalo passou a ser exibido em formato amigável, como
  `De 30/06/2025 a 30/06/2026`;
- os estados de vazio e erro permanecem locais a cada card.

Correção do gráfico Supressão Viral por Mês:

- o adapter passou a aceitar variações de payload com `not_suppressed`,
  `non_suppressed` ou `total`;
- quando a API fornece `total` e `suppressed`, `notSuppressed` é calculado como
  `total - suppressed`;
- a visualização mensal foi trocada para barras mensais próprias em MUI,
  evitando dependência de gráfico misto para contagens e taxa;
- se o endpoint retornar lista vazia, o card mostra “Sem dados disponíveis para
  o período selecionado”.

Cards concluídos nesta fase:

- Indicadores principais de Carga Viral;
- Supressão Viral por Mês;
- Supressão por Província;
- Tempo de Resposta por Mês;
- Histórico de Amostras.

Decisão sobre Supressão por Província:

- nesta fase o card permanece como ranking por barras, ordenado por taxa de
  supressão, porque portar o SVG/mapa antigo do `openldr-frontend` recriaria
  uma solução visual legada;
- a migração para mapa real deve ser avaliada depois, usando componente
  compatível com o design system e payload normalizado da API Python.

Continuam pendentes:

- `/viral-load/clinic`;
- `/viral-load/lab`;
- `/viral-load/patients`;
- `TATvsDisa`, sem endpoint equivalente identificado;
- weekly reports;
- export raw;
- drill-down geográfico avançado.

Próximo passo recomendado:

- implementar `/viral-load/clinic`, começando por amostras registadas/testadas
  por província, TAT por província e distribuição por sexo/idade, sempre com
  filtros internos por card.

## Fase E1.2 — Reestruturação visual de Carga Viral Sumário

A rota `/viral-load` foi reestruturada visualmente para aproximar os cards de
Carga Viral do padrão real dos relatórios de Tuberculose. A fase foi limitada à
apresentação do Sumário de Carga Viral; não foram alterados endpoints, API
Python, shell, sidebar, DPI, TB ou subrotas de Carga Viral.

Problemas corrigidos:

- os indicadores superiores passaram a usar uma grelha responsiva com seis
  cards, três por linha em desktop, dois em tablet e uma coluna em mobile;
- os cards de relatório passaram a usar um wrapper comum baseado em `MainCard`,
  com título, período, ações internas do card, loading, erro e vazio no próprio
  relatório;
- os gráficos e rankings deixaram de usar altura automática sem limite;
- `Supressão Viral por Mês` mostra uma versão compacta dos últimos meses e
  mantém `Média no período` no topo;
- `Tempo de Resposta por Mês` usa chart em frame com altura previsível, evitando
  crescimento vertical indefinido;
- `Supressão por Província` permanece como ranking temporário, mas com altura
  controlada, labels legíveis e scroll interno quando a lista excede o card;
- `Histórico de Amostras` fica visível no grid e usa estado vazio/erro local
  quando o payload não fornece dados utilizáveis.

Decisões visuais:

- o `ViralLoadCardShell` define altura segura para cards em desktop e conteúdo
  com `minWidth: 0`, `minHeight: 0` e overflow controlado;
- charts usam um frame interno com altura na faixa esperada para relatórios
  compactos, em vez de crescerem com o canvas ou com listas longas;
- rankings só usam scroll interno quando a lista é naturalmente maior que o
  espaço disponível, preservando a página sem scroll vertical excessivo;
- cores dos indicadores usam tokens do tema MUI/design system para manter modo
  claro e escuro aceitáveis.

Responsividade:

- indicadores: `3x2` em desktop, `2x3` em tablet e uma coluna em mobile;
- relatórios: duas colunas em desktop e uma coluna em mobile;
- os cards mantêm largura fluida sem `100vw` e sem overflow horizontal.

Pendências antes da Fase E2:

- validar visualmente em ambiente autenticado `/summary`, `/tb` e
  `/viral-load`;
- decidir se `Supressão por Província` deve evoluir de ranking para mapa real
  usando componente compatível com o design system;
- manter `/viral-load/clinic`, `/viral-load/lab` e `/viral-load/patients` fora
  do escopo até o Sumário estar validado.

## Fase E1.3 — Refinamento visual com referência da dashboard antiga CV

A rota `/viral-load` recebeu um refinamento visual orientado pela comparação com
a dashboard antiga de Carga Viral, mantendo a shell oficial e os componentes do
design system da dashboard TB. A fase continua limitada ao Sumário de Carga
Viral e não altera endpoints, API Python, TB, DPI ou subrotas de Carga Viral.

Elementos preservados da dashboard antiga:

- os seis indicadores superiores continuam visíveis e informativos;
- `Supressão Viral por Mês` volta a privilegiar leitura de tendência por
  linha/área, em vez de uma lista longa de barras;
- `Supressão por Província` permanece como ranking por barras enquanto o mapa
  real não for migrado com segurança;
- `Histórico de Amostras` passa a seguir a lógica de resumo mensal compacto,
  semelhante ao antigo `Resumo de Indicadores`.

Adaptações ao design system atual:

- a grelha dos relatórios passa a ter primeira linha assimétrica em desktop:
  `Supressão Viral por Mês` ocupa a área principal e `Supressão por Província`
  fica como card lateral;
- a segunda linha usa dois cards equilibrados para `Tempo de Resposta por Mês`
  e `Histórico de Amostras`;
- em tablet e mobile todos os relatórios voltam para uma coluna, sem overflow
  horizontal;
- o wrapper comum dos cards mantém `MainCard`, ações, período, loading, erro e
  estado vazio locais.

Decisões por card:

- os cards superiores foram preservados, com ajustes apenas de leitura,
  responsividade e alinhamento;
- `Supressão Viral por Mês` usa SVG interno para linha/área com dados reais,
  evitando legenda sobreposta e mantendo `Média no período`;
- `Supressão por Província` usa cores do tema, espaçamento reduzido e scrollbar
  mais discreto no corpo do card;
- `Tempo de Resposta por Mês` mantém Chart.js do design system, mas remove
  labels densos sobre as barras e usa eixo X compacto;
- `Histórico de Amostras` foi convertido para tabela mensal compacta, evitando
  sobreposição de valores no gráfico.

Pendências antes de avançar para `/viral-load/clinic`:

- validação visual autenticada de `/viral-load` em modo claro e escuro;
- decidir se a fase seguinte deve migrar um mapa real de província ou manter o
  ranking até haver componente seguro;
- não iniciar `/viral-load/clinic`, `/viral-load/lab` ou
  `/viral-load/patients` antes de fechar a aceitação visual do Sumário.

## Fase E1.4 — Polimento visual de Carga Viral Sumário

A rota `/viral-load` recebeu uma etapa adicional de polimento visual/CSS para
melhorar leitura, hierarquia e consistência com a experiência dos relatórios TB.
Esta fase não altera dados, endpoints, autenticação, shell, sidebar, TB, DPI ou
subrotas de Carga Viral.

Melhorias de espaçamento:

- a página passa a usar espaçamento mais regular entre indicadores e relatórios;
- a grelha mantém largura máxima coerente e evita overflow horizontal;
- os cards usam padding interno mais consistente no header e no corpo;
- os relatórios reduzem áreas vazias sem comprimir o conteúdo principal.

Melhorias de tipografia:

- títulos de cards ficam mais fortes e com line-height controlado;
- períodos continuam discretos, abaixo do peso visual do título;
- valores principais dos indicadores mantêm destaque sem quebrar em larguras
  menores;
- subtítulos de apoio ficam curtos e secundários.

Melhorias nos cards superiores:

- os seis indicadores foram preservados;
- ícones passam a ter área visual própria e alinhamento consistente;
- período, label e valor foram reajustados para melhor leitura responsiva.

Ajustes no ranking por província:

- o subtítulo foi encurtado;
- o espaçamento entre linhas e barras foi refinado;
- as barras usam cores derivadas do tema;
- o scroll interno fica mais discreto e com respiro no fim da lista.

Ajustes na tabela de Histórico de Amostras:

- a tabela usa cabeçalho sticky dentro da área rolável;
- números ficam alinhados à direita e o mês à esquerda;
- pesos de fonte e bordas foram suavizados;
- o scroll da tabela é fino e não cobre os valores.

Pendências antes de avançar para `/viral-load/clinic`:

- validação visual autenticada final de `/viral-load` em desktop, laptop,
  tablet e mobile;
- revalidar modo escuro com dados reais;
- manter `/viral-load/clinic`, `/viral-load/lab` e `/viral-load/patients` fora
  do escopo até a aceitação visual do Sumário.

## Fase E1.5 — Base visual padrão para relatórios

A rota `/viral-load` Sumário passa a ser a referência visual atual para novos
relatórios da dashboard unificada. Esta fase consolida a base visual sem
adicionar funcionalidades, sem alterar endpoints, sem migrar subrotas de Carga
Viral, sem implementar DPI e sem alterar a lógica funcional dos cards.

Componentes compartilhados criados em
`apps/dashboard/features/shared/reporting`:

- `ReportCardShell`: wrapper visual para relatórios baseado em `MainCard`;
- `ReportGrid`: grelha responsiva para linhas de cards;
- `SummaryMetricCard`: card de indicador superior;
- `ReportEmptyState`, `ReportErrorState` e `ReportLoadingState`: estados locais
  e reutilizáveis;
- `ReportCardActions`: referência visual discreta para ações futuras marcadas
  como “em breve”.

A implementação de Carga Viral mantém os componentes específicos existentes
como camada de compatibilidade. `ViralLoadCardShell` continua disponível para os
cards atuais, mas delega o padrão visual para `ReportCardShell`. Esta decisão
reduz risco, evita um refactor amplo e preserva `/viral-load` como página de
referência.

Padrão do card de relatório:

- usar período discreto no topo, abaixo do título;
- manter título claro, curto e em peso forte;
- reservar o canto superior direito para ações contextuais do card;
- usar padding consistente no cabeçalho e no corpo;
- controlar altura em desktop e permitir altura automática em mobile;
- usar `borderRadius`, borda suave e `background.paper` compatíveis com claro e
  escuro;
- tratar loading, erro e vazio dentro do próprio card;
- evitar overflow horizontal com `minWidth: 0` nos containers;
- usar scroll interno apenas quando o conteúdo do card naturalmente excede a
  área disponível.

Padrão da grelha:

- limitar a largura da página e centralizar o conteúdo;
- usar gap consistente entre indicadores e relatórios;
- usar duas colunas em relatórios quando houver espaço e uma coluna em mobile;
- permitir grelhas assimétricas quando o relatório principal precisar de mais
  área visual;
- nunca usar `100vw` dentro da área da dashboard;
- não recriar shell, header ou sidebar dentro das páginas.

Cores semânticas:

- `success` para supressão, conclusão ou valores positivos;
- `info` para volume informativo ou amostras testadas;
- `warning` para atenção, atraso ou desempenho intermediário;
- `error` para rejeições, falhas ou valores críticos;
- `secondary` para métricas auxiliares como TAT;
- textos secundários devem usar `text.secondary`, sem cinzas fixos.

Tipografia e espaçamento:

- títulos de cards devem ficar perto de `1rem` a `1.08rem`, com `fontWeight`
  forte e `lineHeight` controlado;
- períodos e descrições devem ser menores e discretos;
- valores principais podem ser maiores, mas devem usar `overflowWrap` para não
  quebrar o layout em mobile;
- labels longos devem truncar ou quebrar de forma controlada;
- cards compactos devem manter respiro suficiente para leitura repetida.

Filtros futuros:

- cada card terá seu próprio contexto;
- filtros serão por card, não globais;
- cada card poderá ter período próprio;
- filtros devem ficar dentro do card ou em área contextual do próprio card;
- não criar `FilterBar` global para relatórios;
- esta fase não adiciona UI funcional de filtros.

Documentação, dúvidas/sugestões e exportação:

- documentação será contextual por card;
- dúvidas e sugestões serão contextuais por card;
- exportação de imagem e dados será contextual por card;
- ações ainda não implementadas devem ficar desativadas, discretas ou marcadas
  como “em breve”;
- não criar fluxos falsos que pareçam funcionais antes da implementação real.

Checklist visual para novas páginas:

- usa `ReportCardShell` ou padrão visual equivalente;
- usa `ReportGrid` ou grelha responsiva equivalente;
- não tem overflow horizontal;
- cards têm altura controlada;
- período é visível e discreto;
- ações ficam no canto superior direito;
- loading, erro e vazio estão tratados dentro do card;
- modo escuro está aceitável;
- não usa filtros globais;
- não usa estilos antigos das dashboards legadas;
- não recria shell, sidebar ou header;
- não usa dados mockados para preencher relatórios reais.

Fica para fases futuras:

- implementar `/viral-load/clinic`;
- implementar `/viral-load/lab`;
- implementar `/viral-load/patients`;
- implementar DPI;
- conectar documentação real por card;
- conectar dúvidas e sugestões reais por card;
- conectar filtros de datas por card;
- conectar exportação de imagem e dados por card.

## Fase E1.6 — Padronização de títulos e contexto por módulo

A `apps/dashboard` usa título global neutro porque é a aplicação unificada de
Tuberculose, Carga Viral e DPI. O título global não deve carregar o nome de um
módulo específico.

Título global da aplicação:

- correto: `Portal de Testagem Laboratorial`;
- incorreto: `Portal de Testagem Laboratorial de TB`;
- incorreto: `Portal de Testagem Laboratorial de Tuberculose`;
- incorreto: `Portal de Testagem Laboratorial de Carga Viral`;
- incorreto: `Portal de Testagem Laboratorial de DPI`.

O contexto do módulo deve aparecer como título ou subtítulo da página, nunca no
nome global da aplicação. A fonte central para estes títulos é
`apps/dashboard/config/page-titles.ts`.

Mapeamento de contexto por rota:

- `/summary`: `Sumário Geral`;
- `/tb`: `Tuberculose - Sumário`;
- `/tb/clinic`: `Tuberculose - Província`;
- `/tb/patients`: `Tuberculose - Pacientes`;
- `/viral-load`: `Carga Viral - Sumário`;
- `/viral-load/lab`: `Carga Viral - Laboratório`;
- `/viral-load/clinic`: `Carga Viral - Província`;
- `/viral-load/patients`: `Carga Viral - Pacientes`;
- `/dpi`: `DPI - Sumário`;
- `/dpi/lab`: `DPI - Laboratório`;
- `/dpi/clinic`: `DPI - Província`.

Formato visual esperado no header da dashboard unificada:

- linha principal: `Portal de Testagem Laboratorial`;
- linha secundária/contexto: `Sumário Geral`, `Tuberculose - Sumário`,
  `Carga Viral - Sumário`, `DPI - Sumário` ou equivalente por rota.

Formato esperado no título do browser:

- `Portal de Testagem Laboratorial | Sumário Geral`;
- `Portal de Testagem Laboratorial | Tuberculose - Sumário`;
- `Portal de Testagem Laboratorial | Carga Viral - Sumário`;
- `Portal de Testagem Laboratorial | DPI - Sumário`.

A `apps/tb` original pode manter o título próprio de TB. A correção desta fase
aplica-se à `apps/dashboard`; por isso o `DashboardLayout` do design system deve
preservar defaults compatíveis com TB e receber título neutro explicitamente na
dashboard unificada.

## Fase E2 — Carga Viral Província

A rota `/viral-load/clinic` deixa de ser placeholder principal e passa a
renderizar cards reais de Carga Viral por Província dentro da shell oficial da
`apps/dashboard`. A implementação usa `NEXT_PUBLIC_OPENLDR_API`, token Clerk via
`getToken`, endpoints da API Python e a base visual padronizada de
`apps/dashboard/features/shared/reporting`.

Cards implementados:

- Amostras registadas;
- Amostras testadas;
- Amostras por sexo;
- Amostras por faixa etária;
- Motivo de teste;
- Gravidez;
- Lactação;
- Rejeições;
- Rejeições por Mês;
- Tempo de Resposta;
- Tempo de Resposta por Mês.

Endpoints usados:

- `/hiv/vl/facilities/registered_samples/`;
- `/hiv/vl/facilities/tested_samples_by_facility/`;
- `/hiv/vl/facilities/tested_samples_by_gender_by_facility/`;
- `/hiv/vl/facilities/tested_samples_by_age_by_facility/`;
- `/hiv/vl/facilities/tested_samples_by_test_reason_by_facility/`;
- `/hiv/vl/facilities/tested_samples_pregnant/`;
- `/hiv/vl/facilities/tested_samples_breastfeeding/`;
- `/hiv/vl/facilities/rejected_samples_by_facility/`;
- `/hiv/vl/facilities/rejected_samples_by_month/`;
- `/hiv/vl/facilities/tat_by_facility/`;
- `/hiv/vl/facilities/tat_by_month/`.

Adapters criados:

- `apps/dashboard/features/viral-load/types/facility.ts` define payloads e
  modelos normalizados para métricas por localização, mês e categoria;
- `apps/dashboard/features/viral-load/api/facilities.ts` centraliza as chamadas
  aos endpoints reais de facilities;
- `apps/dashboard/features/viral-load/adapters/facility.ts` normaliza nomes de
  localização, totais, supressão, rejeições, TAT e chaves mensais no formato
  `YYYY-MM` quando ano/mês estão disponíveis.

Payloads e decisões:

- endpoints por localização retornam `requesting_facility` para província,
  distrito ou unidade sanitária, dependendo de `facility_type` e
  `disaggregation`;
- rejeições por localização retornam `total`, por isso o adapter converte esse
  total para a métrica visual de rejeições;
- TAT é calculado a partir de `collection_reception`,
  `reception_registration`, `registration_analysis` e `analysis_validation`
  quando `tat` ou `avg_tat` não existem;
- idade e motivo de teste têm payloads agregados por categoria, então são
  exibidos como distribuição categórica;
- gravidez, lactação, rejeições mensais e TAT mensal usam os últimos 12 meses
  disponíveis do endpoint.

Drill-down:

- a API suporta `facility_type`, `province`, `district`, `health_facility` e
  `disaggregation`;
- nesta fase os cards ficam no nível de Província para proteger estabilidade e
  evitar fluxo complexo de autorização em unidade sanitária;
- drill-down Província → Distrito → Unidade Sanitária fica pendente para E2.1.

Ficam pendentes:

- drill-down geográfico interativo;
- filtros contextuais por card;
- documentação real por card;
- dúvidas/sugestões reais por card;
- exportação de imagem ou dados;
- `/viral-load/lab`;
- `/viral-load/patients`.

Próximo passo recomendado:

- implementar `/viral-load/lab` usando a mesma base visual e os endpoints de
  `/hiv/vl/laboratories/*`, mantendo `/viral-load/patients` fora do escopo até
  os relatórios laboratoriais estarem estabilizados.

## Fase E2.1 — Padrão para rankings horizontais e drill-down

Rankings horizontais devem ser usados quando o relatório compara locais,
categorias ou entidades com uma métrica principal clara. Exemplos:

- amostras registadas por Província, Distrito ou Unidade Sanitária;
- amostras testadas por Província, Distrito ou Unidade Sanitária;
- rejeições por localização;
- Tempo de Resposta por localização.

O componente padrão é `RankingBarList`, em
`apps/dashboard/features/shared/reporting/RankingBarList.tsx`.

Regra de itens visíveis:

- até 8 itens, a lista pode aparecer completa sem scroll interno;
- acima de 8 itens, a área da lista deve ter altura controlada e scroll interno
  vertical;
- a última linha não deve ficar cortada;
- o scroll deve ser fino, discreto e interno ao corpo do card;
- o card não deve crescer indefinidamente para acomodar listas longas.

Padrão visual de cada linha:

- nome da localização à esquerda;
- valor formatado à direita;
- barra horizontal abaixo;
- percentagem opcional quando a métrica for percentual;
- cores semânticas: `success` para volume/produção, `warning` para TAT,
  `error` para rejeições.

Preparação para drill-down:

- cada item deve ter `key`, `label`, `value` e `level`;
- `level` deve representar `province`, `district` ou `facility`;
- `parentKey` fica reservado para breadcrumb futuro;
- `onItemClick` é opcional e, quando existir, ativa cursor pointer e hover
  discreto;
- o breadcrumb futuro deve seguir o padrão
  `Província > Distrito > Unidade Sanitária`.

Regras de layout:

- rankings devem viver dentro de `ReportCardShell` ou padrão visual equivalente;
- cards de ranking devem manter altura visual controlada, normalmente entre
  360px e 460px;
- labels longos devem truncar com tooltip nativo pelo atributo `title`;
- valores não devem sobrepor labels;
- não deve haver overflow horizontal.

## Fase E2.2 — Completar cards de Carga Viral Província

A rota `/viral-load/clinic` mantém os quatro cards principais por Província e
completa os relatórios complementares sem implementar drill-down, filtros,
documentação real, dúvidas/sugestões ou exportação.

Cards preservados:

- Amostras registadas por Província;
- Amostras testadas por Província;
- Tempo de Resposta por Província;
- Rejeições por Província.

Cards complementares:

- Amostras por sexo, usando série mensal por sexo;
- Amostras por faixa etária;
- Motivo de teste;
- Gravidez;
- Lactação;
- Rejeições por Mês;
- Tempo de Resposta por Mês.

Endpoints usados:

- `/hiv/vl/facilities/tested_samples_by_gender_by_month/`;
- `/hiv/vl/facilities/tested_samples_by_age_by_facility/`;
- `/hiv/vl/facilities/tested_samples_by_test_reason_by_facility/`;
- `/hiv/vl/facilities/tested_samples_pregnant/`;
- `/hiv/vl/facilities/tested_samples_breastfeeding/`;
- `/hiv/vl/facilities/rejected_samples_by_month/`;
- `/hiv/vl/facilities/tat_by_month/`.

Adapters e tipos:

- `GenderMetric` normaliza masculino, feminino, não especificado, total e
  chaves mensais seguras;
- `AgeMetric` agrega faixas etárias com labels legíveis;
- `TestReasonMetric` traduz motivos principais para português;
- `PregnancyMetric`, `BreastfeedingMetric`, `RejectionMonthlyMetric` e
  `TatMonthlyMetric` reutilizam a base mensal normalizada;
- listas mensais usam `YYYY-MM` quando ano e mês existem, com fallback seguro.

Visual:

- sexo usa barras mensais empilhadas por Masculino, Feminino e Não especificado;
- idade e motivo de teste usam `RankingBarList`, com scroll interno quando a
  lista passar de 8 itens;
- gravidez, lactação, rejeições mensais e TAT mensal usam gráficos compactos de
  últimos 12 meses;
- todos os cards preservam `ReportCardShell`, período discreto, loading, erro,
  vazio e altura controlada.

Payloads incompatíveis:

- não foi identificado bloqueio de build ou incompatibilidade estrutural nesta
  fase;
- se algum endpoint retornar lista vazia em produção, o card deve mostrar estado
  vazio local sem quebrar a página.

Ficam para fases posteriores:

- drill-down Província → Distrito → Unidade Sanitária;
- filtros contextuais por card;
- documentação real;
- dúvidas e sugestões;
- exportação;
- `/viral-load/patients`.

## Fase E3 — Carga Viral Laboratório

A rota `/viral-load/lab` deixa de ser placeholder principal e passa a renderizar
relatórios laboratoriais reais de Carga Viral, usando a API Python e a mesma
base visual consolidada em `/viral-load` e `/viral-load/clinic`.

Cards implementados:

- Amostras testadas por laboratório;
- Amostras testadas por mês;
- Tempo de Resposta por laboratório;
- Tempo de Resposta por mês;
- Rejeições por laboratório;
- Rejeições por mês;
- Motivo de teste;
- Motivo de teste por mês.

Endpoints usados:

- `/hiv/vl/laboratories/tested_samples/`;
- `/hiv/vl/laboratories/tested_samples_by_month/`;
- `/hiv/vl/laboratories/tat_by_lab/`;
- `/hiv/vl/laboratories/tat_by_month/`;
- `/hiv/vl/laboratories/rejected_samples/`;
- `/hiv/vl/laboratories/rejected_samples_by_month/`;
- `/hiv/vl/laboratories/tested_samples_by_test_reason/`.

Adapters e tipos:

- `apps/dashboard/features/viral-load/types/laboratory.ts` define payloads e
  modelos normalizados para métricas por laboratório, mês e motivo;
- `apps/dashboard/features/viral-load/api/laboratories.ts` centraliza as
  chamadas aos endpoints reais de `/hiv/vl/laboratories/*`;
- `apps/dashboard/features/viral-load/adapters/laboratory.ts` normaliza nomes
  de laboratório, totais, rejeições, TAT, motivos de teste e chaves mensais
  `YYYY-MM` quando ano e mês existem.

Visual:

- rankings por laboratório usam `RankingBarList` com scroll interno quando há
  listas extensas;
- gráficos mensais usam barras compactas dos últimos 12 meses;
- `Motivo de teste por mês` usa o endpoint mensal de motivos, com barras
  empilhadas para Rotina, Falha terapêutica e Não especificado;
- TAT usa cor semântica de atenção;
- rejeições usam cor semântica de erro;
- todos os cards usam `ReportCardShell`, período discreto, loading, erro, vazio
  e altura controlada.

Relatórios legados não migrados nesta fase:

- weekly reports;
- backlog;
- `TATvsDisa`;
- qualquer relatório disponível apenas no frontend/backend Node legado.

Ficam para fases posteriores:

- `/viral-load/patients`;
- drill-down;
- documentação real;
- dúvidas e sugestões;
- filtros de datas completos;
- exportação;
- weekly reports e backlog apenas se houver endpoint Python claro.

## Fase E3.1 — Padronização visual de cards e gráficos

A área de Carga Viral recebeu uma camada de padronização visual aplicada a
`/viral-load`, `/viral-load/clinic` e `/viral-load/lab`. A fase é apenas de UI,
CSS, dimensões e visualização; não altera endpoints, API Python, autenticação,
shell, sidebar, drill-down, filtros, exportação ou pacientes.

Padrão de altura dos cards:

- cards médios de relatório usam altura visual comum para que pares lado a lado
  fiquem alinhados;
- rankings e gráficos mensais usam corpo controlado com scroll interno ou área
  gráfica própria;
- tabelas continuam com altura controlada e rolagem interna quando necessário;
- cards não devem crescer indefinidamente para acomodar listas longas.

Quando usar `RankingBarList`:

- rankings por localização ou categoria, como laboratório, província, unidade
  sanitária, rejeições, TAT por local e supressão por província;
- listas com muitos itens devem manter título/subtítulo fixos e rolar apenas a
  área do ranking;
- barras devem escalar pelo maior valor do ranking, exceto quando o valor visual
  representa uma percentagem real, como supressão por província.

Quando usar gráfico mensal:

- séries temporais por mês, como amostras testadas por mês, TAT por mês,
  rejeições por mês e motivo de teste por mês;
- estes relatórios usam barras verticais com largura mínima visual, eixo X com
  labels mensais e altura controlada;
- `RankingBarList` não deve ser usado para séries temporais mensais.

Regras de scroll interno:

- todos os itens reais devem permanecer acessíveis;
- se houver 11 províncias ou muitos laboratórios, a lista deve rolar dentro do
  card sem cortar a última linha;
- scrollbars devem ser discretas e não cobrir valores.

Regras para gráficos de linha:

- `Supressão Viral por Mês` mantém linha/área e deve mostrar o valor percentual
  em cada ponto;
- labels podem alternar posição ou reduzir tamanho para evitar sobreposição,
  mas não devem ser escondidas quando houver até 12 pontos mensais.

Regras para evitar cards gigantes e barras minúsculas:

- cada card mantém altura de relatório padrão;
- listas longas usam scroll interno;
- rankings por laboratório escalam pelo maior valor do conjunto, não pela
  participação percentual no total geral;
- gráficos mensais têm altura mínima e barras verticais com largura mínima para
  preservar leitura em desktop, tablet e mobile.

## Microinterações e paleta visual dos gráficos

Os relatórios de Carga Viral usam microinterações discretas para melhorar a
leitura sem transformar a dashboard num produto promocional. O movimento deve
ser curto, funcional e institucional.

Paleta semântica:

- `success`: verde institucional suave para supressão, validação e séries
  positivas;
- `info`: azul técnico para amostras, testadas e métricas informativas;
- `warning`: âmbar controlado para pendentes, não especificados e atenção;
- `error`: vermelho contido para rejeições e falhas;
- `secondary`: roxo/lilás suave para métricas auxiliares como tempo/TAT;
- `neutral`: cinza para fundos de barras, trilhos e estados secundários.

Regras de animação:

- rankings horizontais podem animar a largura da barra na entrada, com duração
  curta entre 300 e 500 ms;
- gráficos mensais podem animar barras verticais a partir da base;
- gráficos de linha/área podem usar transições de opacidade e pontos com
  `title`/hover simples;
- animações infinitas, pulsos chamativos e deslocamentos que mudem o layout não
  devem ser usados.

Hover e feedback:

- linhas de ranking podem ganhar fundo levemente colorido e maior contraste na
  barra;
- cards podem realçar discretamente borda/sombra;
- o hover não deve aumentar dimensões nem mover conteúdo adjacente;
- cursor de clique deve aparecer apenas em itens realmente acionáveis.

Loading:

- cards de Carga Viral devem preservar a altura durante carregamento;
- skeletons devem usar wave loading quando disponível;
- loading, erro e vazio permanecem dentro do card, sem quebrar a página inteira;
- skeletons precisam funcionar em modo claro e escuro.

Acessibilidade e performance:

- efeitos devem respeitar `prefers-reduced-motion`; quando o utilizador pedir
  redução de movimento, a animação de entrada deve ser removida ou reduzida;
- transições devem atuar em propriedades baratas como `opacity`, `filter` e
  `transform`;
- cores não podem depender apenas de saturação extrema para comunicar estado;
- vermelho e laranja devem ser usados com moderação em áreas grandes.

## Fase E4 — Carga Viral Pacientes

A rota `/viral-load/patients` deixa de ser placeholder e passa a oferecer uma
página real de pesquisa/listagem de pacientes de Carga Viral. A fase usa apenas
API Python, `NEXT_PUBLIC_OPENLDR_API`, token Clerk via `getToken` e componentes
visuais da dashboard unificada. Não há backend Node legado, SQL direto,
exportação, drill-down, filtros globais, documentação real ou sugestões reais.

Métodos de pesquisa implementados:

- Por Unidade Sanitária;
- Por Nome;
- Por Resultado;
- Por Motivo de Teste.

Endpoints confirmados e usados:

- `/hiv/vl/patients/by_facility/`;
- `/hiv/vl/patients/by_name/`;
- `/hiv/vl/patients/by_result_type/`;
- `/hiv/vl/patients/by_test_reason/`.

Parâmetros usados:

- `interval_dates`, com o intervalo padrão de Carga Viral;
- `page` e `per_page`, seguindo a paginação da API;
- `health_facility` para pesquisa por unidade sanitária;
- `first_name` e `surname` derivados do texto digitado na pesquisa por nome;
- `result_type` com valores `suppressed` e `not_suppressed`;
- `test_reason` com valores aceites pela API Python: `Routine`, `Repeat`,
  `Suspected treatment failure` e `Reason Not Specified`.

Adapter criado:

- `apps/dashboard/features/viral-load/adapters/patients.ts` normaliza variações
  de nome, identificadores, localização, datas, resultado, carga viral, motivo
  de teste e estado;
- a UI consome o tipo normalizado `ViralLoadPatientRecord`;
- respostas paginadas e listas simples são aceites defensivamente.

Campos mostrados na tabela:

- Nome;
- NID / Identificador;
- Unidade Sanitária;
- Província;
- Distrito;
- Data da amostra;
- Data do resultado;
- Resultado;
- Carga viral;
- Motivo de teste;
- Estado.

Decisões de privacidade:

- a tabela mostra apenas campos essenciais ao fluxo de pesquisa;
- telefone e outros campos sensíveis retornados pela API não são exibidos;
- os resultados não são guardados em `localStorage`;
- não há exportação nesta fase.

Tratamento de erro conhecido:

- a pesquisa por motivo de teste pode falhar no backend Python enquanto o
  endpoint tentar formatar `HL7ResultStatusCode` sem incluir esse campo na
  query;
- o frontend trata essa falha como estado visual amigável dentro do card, sem
  mostrar o nome técnico do campo ao utilizador;
- a correção definitiva deve ser feita numa fase posterior de revisão da API.

Pendências:

- exportação contextual;
- filtros de período completos;
- documentação real por card;
- dúvidas/sugestões reais;
- drill-down de paciente ou amostra.

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

## Fase F1 — DPI/EID Sumário

A rota `/dpi` deixa de usar a apresentação piloto própria com `DpiCardShell` e
charts Apex como base visual principal. O sumário DPI/EID passa a seguir o mesmo
padrão consolidado em Carga Viral: `ReportCardShell`, `ReportGrid`,
`SummaryMetricCard`, `MonthlyBarChart`, `MonthlyStackedBarChart`,
`RankingBarList`, skeleton/loading, erro e vazio dentro de cada card.

Endpoints usados nesta fase:

- `/hiv/eid/summary/indicators/`;
- `/hiv/eid/summary/number_of_samples/`;
- `/hiv/eid/summary/positivity/`;
- `/hiv/eid/summary/tat/`;
- `/hiv/eid/summary/rejected_samples_by_month/`;
- `/hiv/eid/summary/samples_by_equipment/`;
- `/hiv/eid/summary/indicators_by_province/`.

Cards implementados/refatorados:

- Indicadores principais de DPI;
- Número de amostras por mês;
- Positividade por mês;
- Rejeições por mês;
- Tempo de Resposta por mês;
- Amostras por equipamento;
- Indicadores por província.

Adapters criados/refatorados:

- os indicadores principais normalizam registadas, testadas, rejeitadas,
  pendentes, positivas, negativas, taxa de rejeição e taxa de positividade;
- séries mensais passam a ter `monthKey` único e labels amigáveis, evitando
  chaves React baseadas apenas em `Jun`, `Jul` etc.;
- payloads com `{ status: "error" }` são tratados como erro amigável de card;
- valores numéricos em string, nomes legados e campos em inglês/português são
  normalizados antes da renderização.

Regras visuais:

- indicadores no topo usam cards compactos responsivos;
- relatórios usam grelha de dois cards por linha em desktop e uma coluna em
  mobile;
- rankings por equipamento/província usam scroll interno quando necessário;
- gráficos mensais ficam com altura controlada e não expandem a página;
- erros técnicos da API não devem ser expostos ao utilizador final.

Cards e endpoints pendentes:

- `/hiv/eid/summary/tat_samples/` e
  `/hiv/eid/summary/samples_by_equipment_by_month/` continuam disponíveis, mas
  não foram priorizados na nova composição para evitar excesso de densidade no
  Sumário;
- relatórios detalhados por província, unidade sanitária, laboratório, rotas e
  pacientes ficam para `/dpi/clinic`, `/dpi/lab` e fases posteriores.

Riscos encontrados:

- alguns endpoints DPI/EID ainda podem devolver payloads agregados ou vazios em
  formatos diferentes por `lab_type`;
- TAT tem seis segmentos e pode ficar visualmente denso se todos os rótulos
  forem exibidos em espaços pequenos;
- indicadores por província são úteis no Sumário, mas podem migrar para
  `/dpi/clinic` se a página ficar demasiado densa.

Próximos passos:

- F2 deve implementar `/dpi/clinic` com rankings por província, distrito e
  unidade sanitária;
- F3 deve implementar `/dpi/lab` com relatórios laboratoriais;
- `/dpi/routes`, drill-down, filtros completos, exportação, documentação real e
  sugestões permanecem fora do escopo até fases próprias.

## Fase F1.2 — Validação final do DPI Sumário

O Sumário DPI foi revisto para manter paridade funcional com a dashboard DPI
atual e com o padrão visual consolidado da dashboard unificada. Todos os cards
passam a usar o período global centralizado:

- cálculo: hoje menos 12 meses até hoje;
- API: `interval_dates=startDateIso,endDateIso`;
- UI: `De DD de Mês de YYYY a DD de Mês de YYYY`.

Relatórios confirmados em `/dpi`:

- Indicadores principais: Total de Amostras, Amostras Registadas, Amostras
  Testadas e Amostras Rejeitadas;
- Positividade das Amostras;
- Amostras por Província, preservando a distinção Convencional/POC;
- Tempo de Resposta por mês;
- TRL - Colheita na US a Recepção no Hub, com seletor interno de categoria;
- Amostras Rejeitadas/Mês;
- Amostras Testadas por Equipamento;
- Principais Indicadores das Amostras, com abas Todas, Convencional e POC.

Endpoints usados:

- `/hiv/eid/summary/indicators/`;
- `/hiv/eid/summary/positivity/`;
- `/hiv/eid/summary/indicators_by_province/`;
- `/hiv/eid/summary/tat/`;
- `/hiv/eid/summary/tat_samples/`;
- `/hiv/eid/summary/rejected_samples_by_month/`;
- `/hiv/eid/summary/samples_by_equipment/`;
- `/hiv/eid/summary/number_of_samples/`.

Correções de paridade:

- os indicadores superiores foram reduzidos para os quatro indicadores
  obrigatórios da dashboard DPI;
- o card de província passou a mostrar barras segmentadas por Convencional e
  POC em vez de um ranking simples total;
- o card TRL usa seletor interno de categoria sem criar filtro global;
- a tabela de principais indicadores compõe séries mensais reais por `lab_type`
  e mantém scroll horizontal interno;
- erros de endpoint continuam tratados dentro do card com mensagens amigáveis.

Pendências:

- o mapa DPI original não foi portado nesta fase; a representação por província
  usa barras segmentadas como alternativa provisória;
- validação visual autenticada deve confirmar os dados em produção antes da Fase
  F2;
- a próxima fase recomendada é F2 — DPI Província.
