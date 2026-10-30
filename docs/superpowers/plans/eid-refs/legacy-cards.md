# Legacy EID /lab and /clinic cards (openldr-dashboard reports/eid/{lab,clinic})

Common to both pages:
- Each card has "Exportar Dados", "Baixar Gráfico" and "Reiniciar o relatório", plus a doc.mdx.
- Layout is a 2-column grid.
- No y-axis titles, no percentage lines, no combo charts.

## /lab (popup = labs; all stacked bars unless noted)

| # | legacy folder | title | series (keys) | in-card control | drill |
|---|---|---|---|---|---|
| 1 | SamplesTestedByConventional | Amostras Testadas por lab/Convencional | Negativo = Total−Positivity, Positivo | — | lab → province → district → clinic |
| 2 | SamplesTestedByPoc | Amostras Testadas por lab/PoC | Negativo, Positivo | — | starts per province (R18: province → district → facility) |
| 3 | SamplesTestedByMonth | Amostras Testadas/Mês (+ " (Convencional)" / " (PoC)" when chosen) | Negativo, Positivo | select Todos/Convencional/PoC → labType | — |
| 4 | TatSamples | TRL - <segment> | <7, 7-15, 16-21, >21, Sem datas; x = lab | segment select (category 0–5) | — |
| 5 | TatConventional | Tempo de Resposta (Convencional) | 6 TAT segments | — | lab → province → district → clinic |
| 6 | SamplesRegisteredByMonth | Amostras Registadas/Mês | Convencional, PoC | — | — |
| 7 | SamplesByEquipmentMonthly | Amostras Testadas por Equipamento | 7 equipment groups; x = month | — | — |
| 8 | SamplesByLabEquipment | Amostras Testadas por Equipamento (Lab) | 7 groups; x = lab | — | — |
| 9 | SamplesRejectedByMonth | Amostras Rejeitadas/Mês | 9 reasons | — | — (✱2: lab filter ignored in legacy) |
| 10 | SamplesRejected | Amostras Rejeitadas por Lab | 9 reasons; x = receiving lab | — | — |

The legacy lab popup listed labs from /dict/labs plus PoC sites from /dict/pocs, and sent the *names* as labCodes.

## /clinic (popup = facility: Província / Distrito / Unidade Sanitária)
The cards come in pairs, "by facility" then "by month". The by-facility cards drill province → district → clinic; the by-month cards don't drill.

| # | title | chart | series | control |
|---|---|---|---|---|
| 1 | Amostras Registadas/Província | **grouped** (not stacked) bars | Convencional, PoC | — |
| 2 | Amostras Registadas/Mês | grouped | same | — |
| 3 | Amostras Testadas/Província | grouped | Convencional, PoC | — |
| 4 | Amostras Testadas/Mês | grouped | same | — |
| 5 | Amostras Rejeitadas/Província | stacked | 9 reasons | — |
| 6 | Amostras Rejeitadas/Mês | stacked | 9 reasons | — |
| 7 | Amostras Testadas por Sexo/Província - <categoria> | 2 stacks (M, F) | Masculinos Positivos #008FFB, Masculinos Negativos #7ac6ff (stack M); Femininos Positivos #FF4560, Femininos Negativos #FF7A91 (stack F) | select Todos/PoC/Convencional |
| 8 | Amostras Testadas por Sexo/Mês - <categoria> | same | same | same |
| 9 | Tempo de Resposta por província (média) | stacked | 6 TAT segments | — |
| 10 | Tempo de Resposta por Mês (média) | stacked | 6 segments | — |
| 11 | Tempo de Resposta por Província (em dias) | stacked | <7, 7-15, 16-21, >21, Sem datas | segment select |
| 12 | Tempo de Resposta por Mês (em dias) | stacked | same | segment select |

The legacy spells the TAT segment labels inconsistently ("à" on the lab page, "a" on the clinic page). The Sumário card labels in `apps/eid/lib/eid/series.ts` are the standard.
