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
