# Testes de dúvidas e sugestões após redeploy

Execução iniciada em 30/10/2026 às 14:37:50 (Africa/Maputo).

## APIs

- Desenvolvimento: `https://dev.openldr.org.mz`.
- Produção: `https://api.openldr.org.mz`.
- Autenticação nova em cada API: `POST /auth/login` → HTTP 200.
- Os pedidos seguintes usaram o token devolvido no cabeçalho Bearer.
- Credenciais e tokens não estão incluídos neste relatório nem na configuração das dashboards.

## Envios autenticados

Cada endpoint recebeu uma sugestão (`duvida=false`) e uma dúvida (`duvida=true`)
em cada ambiente. As mensagens foram identificadas como testes de integração.

| Endpoint | Dev sugestão | Dev dúvida | Produção sugestão | Produção dúvida |
|---|---|---|---|---|
| `/hiv/eid/send-suggestion` | 200 | 200 | 200 | 200 |
| `/hiv/send-suggestion` | 200 | 200 | 200 | 200 |
| `/hiv/vl/send-suggestion` | 200 | 200 | 200 | 200 |
| `/tb/cultura/send-suggestion` | 200 | 200 | 200 | 200 |
| `/tb/gx/send-suggestion` | 200 | 200 | 200 | 200 |
| `/tb/send-suggestion` | 200 | 200 | 200 | 200 |

Os 24 pedidos devolveram:

```json
{"status":"success","code":200,"message":"Mensagem enviada com sucesso."}
```

A API confirmou o envio; a chegada às caixas de correio não foi verificada.

## Validação

Em todos os seis endpoints, nos dois ambientes:

- Sem token: HTTP 401, `Invalid or missing token`.
- JSON sem os campos obrigatórios: HTTP 400, `content must be a non-empty string of at most 100000 characters`.
- `duvida=invalid`: HTTP 400, `duvida must be true or false`.

O corpo válido incluiu `content` em HTML, `reportTitle`, `category` e `userName`.
O email do utilizador para CC é obtido pela API a partir da autenticação.

O Swagger actualizado lista os seis endpoints em ambos os ambientes. Os preflights
CORS de TB e VL devolveram HTTP 200 nas duas APIs para as origens
`https://tb.openldr.org.mz`, `https://vl.openldr.org.mz`,
`https://cargaviral.openldr.org.mz` e `http://localhost:3000`, permitindo POST
e os cabeçalhos `authorization` e `content-type`.

## Integração das dashboards

- `MainCard` usa os serviços fornecidos pelo `SuggestionProvider` da dashboard.
- O token da sessão Clerk é obtido no momento de cada envio e enviado como Bearer,
  seguindo o padrão já usado nos restantes pedidos da dashboard.
- Não é efectuado login com credenciais de serviço no frontend.
- Caminhos padrão: TB `/tb/gx/send-suggestion`, VL `/hiv/vl/send-suggestion`, EID `/hiv/eid/send-suggestion`.
- A origem da API é `NEXT_PUBLIC_OPENLDR_API`; o caminho pode ser substituído
  por `NEXT_PUBLIC_OPENLDR_SUGGESTION_PATH` no build.
- Correspondência corrigida: `duvida=true` para dúvida e `false` para sugestão.
- As falhas rejeitam o envio, permitindo ao formulário conservar o texto para nova tentativa.

## Verificação local

- Vitest: 12 testes passaram (`suggestion-endpoint.test.ts` e `MainCard.test.tsx`).
- TypeScript: TB, VL e EID passaram com `tsc --noEmit --incremental false`.
  Foi necessário compilar primeiro a dependência local `@repo/auth`, incluindo declarações.
- `git diff --check`: sem erros.
- A autenticação real das APIs foi testada com tokens novos de `/auth/login`.
  A submissão numa sessão Clerk no navegador não foi executada neste teste.

Fontes: pedidos HTTP reais e Swagger em
`https://dev.openldr.org.mz/apidocs/` e `https://api.openldr.org.mz/apidocs/`.
