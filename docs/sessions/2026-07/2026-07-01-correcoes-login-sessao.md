# Handoff — 2026-07-01 — Correções de login, sessão e testes E2E

## Contexto
Auditoria via Playwright em https://mentoria-sublime.onrender.com + correção dos bugs encontrados (opção 3 escolhida pelo usuário) + testes da área logada (admin@plataforma.com).

## Commits desta sessão (branch master, deployados no Render)
| Commit | Descrição |
|---|---|
| `e89ede8` | fix: interceptor 401 não redireciona em rotas `/auth/*` (erro de login agora visível) + labels sobrepostos no Input (`Icon ? 'left-10' : 'left-4'`) + validação PT-BR no RegisterPage (`noValidate` + mensagens manuais) + `x-powered-by` desabilitado + rota `/api/health` |
| `258030e` | fix: `getUser()` em `client/src/lib/auth.js` — conversão base64url→base64 antes do `atob` (JWT usa base64url) |
| `648e2d5` | fix: **causa raiz da sessão perdida** — `/api/auth/me` retorna o usuário direto, mas `AuthContext.jsx:22` fazia `setUser(res.data.user)` → `undefined` → `isAuthenticated: false` → redirect. Corrigido para `res.data.user \|\| res.data` |

## Verificado em produção (bundle index-MSX9syNu.js)
- ✅ Login com senha errada exibe "Credenciais inválidas." (não redireciona mais)
- ✅ Sessão persiste em refresh/navegação direta (/dashboard, /ranking, /checklist, /monthly, /admin/*)
- ✅ Labels do /register não sobrepõem ícones (left: 40px)
- ✅ /api/health retorna JSON; X-Powered-By ausente
- ✅ Área logada admin: Dashboard, Mentoradas (57), Validações, Checklist admin (96 itens), Prêmios, Ranking
- ℹ️ Rate limiting já existia (não era bug): general 500/15min, auth 50/15min, login 10/15min, register 5/h

## Observações não corrigidas (dados/UX — decidir com o usuário)
1. **Dados sujos no banco:** instagram com arroba duplicado (`@@anasilva`, `@@carlasouza`); usuárias de teste em produção (ana@exemplo.com, carla@exemplo.com)
2. **/admin/prizes** não pré-carrega os títulos atuais dos prêmios nos inputs (aparecem vazios com placeholder)
3. **/api/monthly/2026-07** retorna 404 quando o mês não tem dados — a UI trata, mas gera erro no console (poderia ser 200 com null)
4. TODO em `server/src/app.js`: instalar `compression` para gzip

## Credenciais de teste
admin@plataforma.com / admin123
