# Handoff — 2026-07-09 — Auditoria dados mensais + ranking

## Contexto
Auditoria completa do fluxo aluna → envio de resultados → validação admin → ranking/histórico. Usuário escolheu o pacote completo (críticos + altos + médios). Todas as 7 correções foram implementadas e commitadas.

## Commits desta sessão (não pushados)
| Commit | Correção |
|---|---|
| `b51ee9a` | CRÍTICO: rejeição real (validated_by_admin=2 + motivo + log de auditoria) |
| `9481a31` | CRÍTICO: admin vê pendências de validação de TODOS os meses (não só o atual) |
| `31eb271` | CRÍTICO: aluna não edita mês já aprovado (409 no backend + fieldset disabled no form) |
| `00d543c` | ALTO: GET /monthly/:month retorna 200 com null (antes 404 poluía console/UX) |
| `068b767` | ALTO: validação do envio mensal — backend 400 + frontend pré-submit; vazios enviam null (não 0) |
| `c99d52a` | ALTO: ranking ponderado (faixas de faturamento + crescimento %) e followers_gained no ranking geral |
| `c8356d3` | MÉDIO: getCurrentMonth em America/Sao_Paulo (client `lib/utils.js` + server `utils/formatters.js`) |

## Decisões técnicas
- Convenção `validated_by_admin`: 0=pendente, 1=aprovado, 2=rejeitado
- Score de faturamento: híbrido — 50% crescimento (cap 100) + 50% faixa absoluta (tiers 2k/5k/10k/20k); sem mês anterior usa só a faixa
- Score de seguidores: percentual (+10% = 100 pontos)
- `getGeneralRanking`: LEFT JOIN agregando `SUM(followers_count - followers_previous)` dos meses validados → `followers_gained`; também expõe `checklist_score` (alias de avg_checklist) para o StarGroup
- `client/dist` é versionado — rebuild via `npx vite build` incluído nos commits

## Pendências
1. **Push/deploy** — `git push` é exclusivo do @devops e precisa de aprovação do usuário. 7 commits locais à frente do remoto.
2. **Validar em produção** após deploy no Render (https://mentoria-sublime.onrender.com): login admin `admin@plataforma.com`, testar rejeição, ranking geral (coluna seguidores), envio bloqueado em mês aprovado.
3. Working tree tem muitos untracked (`.agents/`, `.aiox/`, `squads/`, etc.) — NUNCA usar `git add -A`; sempre paths específicos.

## Arquivos-chave tocados
- `server/src/modules/monthly/monthly.service.js` / `monthly.controller.js`
- `server/src/modules/admin/admin.service.js` / `admin.controller.js`
- `server/src/modules/ranking/ranking.service.js`
- `server/src/utils/rankingCalculator.js` / `formatters.js`
- `client/src/pages/MonthlyPage.jsx`, `client/src/lib/utils.js`
- `client/src/components/admin/ValidationCard.jsx`, `client/src/pages/admin/ValidationsPage.jsx`
