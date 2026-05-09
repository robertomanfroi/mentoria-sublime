# PRD — Automação de Resumos da Mentoria Sublime

**Produto:** Workflow de Automação de Resumos
**Cliente:** Suellen Warmling — Mentoria Sublime
**Versão:** 1.0
**Data:** 08 de maio de 2026
**Status:** Draft
**PM:** Morgan

---

## 1. Visão Geral

### Problema

Após cada sessão de mentoria em grupo no Zoom, o processo de gerar e distribuir o resumo para as mentoradas é feito manualmente:

1. Acessar o resumo automático do Zoom
2. Copiar a transcrição
3. Aplicar um prompt específico para organizar os insights
4. Formatar o documento com a identidade visual da Mentoria Sublime
5. Salvar no Google Drive
6. Avisar as mentoradas no grupo de WhatsApp

Este processo consome tempo recorrente, está sujeito a esquecimento, e a qualidade do resumo varia dependendo de quem executa.

### Solução

Sistema de automação completo via N8N que, ao detectar o fim de uma reunião Zoom com transcrição, executa todo o pipeline automaticamente — da transcrição ao PDF no Drive e notificação no WhatsApp — sem nenhuma intervenção manual.

### Métrica de Sucesso Principal

**Zero intervenção manual** para geração e distribuição de resumos após implantação.

---

## 2. Objetivos

| # | Objetivo | Métrica |
|---|---|---|
| O1 | Eliminar trabalho manual pós-sessão | 0 toques manuais no fluxo de resumo |
| O2 | Garantir resumo entregue em < 10 min após reunião | Tempo médio trigger → WhatsApp ≤ 10 min |
| O3 | Manter padrão visual da Mentoria Sublime | 100% dos docs gerados com template correto |
| O4 | Garantir visibilidade de falhas | Notificação no grupo em 100% das falhas |

---

## 3. Usuários

### Usuário Primário — Suellen Warmling (Operadora)
- Conduz as sessões de mentoria no Zoom
- **Não executa nenhuma ação** após a reunião terminar
- Recebe confirmação no WhatsApp de que o resumo está pronto

### Usuário Secundário — Mentoradas
- Recebem o link do Drive via grupo de WhatsApp
- Acessam o PDF e o Google Doc com o resumo da sessão

---

## 4. Escopo

### Dentro do Escopo (v1.0)

- Trigger automático via webhook Zoom (`recording.completed`)
- Download da transcrição VTT da reunião
- Geração de resumo estruturado via Claude API (modelo `claude-sonnet-4-6`)
- Estrutura do resumo: Insights Gerais + Análise Individual por mentorada
- Duplicação do modelo Google Docs com identidade visual da Mentoria Sublime
- Substituição de placeholders `{{NOME}}`, `{{DATA}}`, `{{CONTEUDO}}`
- Exportação automática do Google Doc para PDF
- Upload do PDF na pasta correta do Google Drive
- Notificação de sucesso no grupo de WhatsApp via Evolution API
- Notificação de falha (sem transcrição) no grupo de WhatsApp

### Fora do Escopo (v1.0)

- Envio individual do resumo para cada mentorada
- Integração com plataforma de gestão da mentoria
- Dashboard de histórico de sessões
- Edição do resumo antes de publicar
- Suporte a múltiplos idiomas

---

## 5. Requisitos Funcionais

### RF-01 — Trigger de Reunião
- O sistema deve detectar o evento `recording.completed` do Zoom via webhook
- Deve responder ao Zoom em < 3 segundos (200 OK) para evitar retry
- Deve validar a assinatura HMAC SHA256 do webhook para segurança

### RF-02 — Espera pela Transcrição
- O sistema deve aguardar 5 minutos após o trigger antes de buscar a transcrição
- Justificativa: Zoom leva até 5 min para processar e disponibilizar o arquivo VTT

### RF-03 — Autenticação Zoom
- O sistema deve obter token OAuth via Server-to-Server OAuth a cada execução
- Credenciais: Account ID + Client ID + Client Secret (Server-to-Server App)

### RF-04 — Download da Transcrição
- O sistema deve localizar o arquivo com `file_type: "TRANSCRIPT"` no payload
- Deve fazer download autenticado do arquivo VTT
- Se não houver transcrição: notificar o grupo e encerrar o fluxo

### RF-05 — Geração do Resumo (Claude)
- Input: transcrição VTT parseada (texto limpo, sem timestamps)
- Modelo: `claude-sonnet-4-6`, `max_tokens: 8000`
- Output obrigatório: resumo estruturado + linha `NOME_REUNIAO: [nome]` ao final
- Estrutura do resumo:
  - **Seção 1:** Insights gerais aplicáveis a todas as mentoradas
  - **Seção 2:** Por mentorada — Situação / Orientações / Ações / Conteúdos sugeridos
- Regras: sem mencionar o nome de quem orientou, direto e acionável

### RF-06 — Criação do Documento
- Duplicar o documento modelo identificado por `GOOGLE_DRIVE_TEMPLATE_DOC_ID`
- Nome do novo documento: `Resumo Mentoria Sublime - {NOME} - {DATA}`
- Salvar na pasta `1si0pPBrHXbxUCz6TN1uH-EF39Md5n7Xs` do Google Drive
- Substituir os 3 placeholders via Google Docs API `batchUpdate`:
  - `{{NOME}}` → nome extraído pelo Claude
  - `{{DATA}}` → data da reunião em português (ex: "8 de maio de 2026")
  - `{{CONTEUDO}}` → resumo completo gerado pelo Claude

### RF-07 — Exportação para PDF
- Exportar o Google Doc gerado para PDF via Google Drive API
- Salvar o PDF na mesma pasta do Drive com o mesmo nome + extensão `.pdf`

### RF-08 — Notificação WhatsApp
- Enviar mensagem no grupo via Evolution API ao final do fluxo
- Mensagem de sucesso deve conter: nome da mentorada/reunião, nome do arquivo, link da pasta
- Mensagem de falha (sem transcrição) deve orientar verificação das configurações do Zoom

---

## 6. Requisitos Não-Funcionais

| # | Requisito | Critério |
|---|---|---|
| RNF-01 | Tempo total de execução | ≤ 10 min do trigger ao WhatsApp |
| RNF-02 | Disponibilidade | Depende do uptime do N8N (n8n.suellenwarmling.com.br) |
| RNF-03 | Segurança | Credenciais via variáveis de ambiente — nunca hardcoded |
| RNF-04 | Segurança webhook | Validação HMAC SHA256 em todo request Zoom |
| RNF-05 | Observabilidade | Falhas visíveis via notificação WhatsApp + logs N8N |

---

## 7. Arquitetura do Sistema

### Stack

| Componente | Tecnologia |
|---|---|
| Orquestração | N8N (n8n.suellenwarmling.com.br) |
| Fonte de dados | Zoom Cloud Recording API |
| IA / Resumo | Anthropic Claude API (`claude-sonnet-4-6`) |
| Documento | Google Docs API + Google Drive API |
| Notificação | Evolution API → WhatsApp |

### Fluxo Completo

```
Zoom (recording.completed)
  → Webhook N8N
  → Validação HMAC
  → Confirma 200 OK (async)
  → Aguarda 5 min
  → Obtém token OAuth Zoom
  → Verifica existência de transcrição
    ├── Sem transcrição → WhatsApp aviso → FIM
    └── Com transcrição → Download VTT
        → Parse VTT (remove timestamps)
        → Claude API (gera resumo + extrai nome)
        → Formata dados (nome, data, docName)
        → Google Drive: copia template
        → Google Docs API: substitui placeholders
        → Google Drive API: exporta PDF
        → Google Drive: salva PDF na pasta
        → Evolution API: WhatsApp grupo ✅
```

### Variáveis de Ambiente Necessárias

| Variável | Descrição |
|---|---|
| `ZOOM_ACCOUNT_ID` | ID da conta Zoom (Server-to-Server OAuth) |
| `ZOOM_WEBHOOK_SECRET_TOKEN` | Token para validação HMAC do webhook |
| `ANTHROPIC_API_KEY` | Chave da API Anthropic |
| `GOOGLE_DRIVE_TEMPLATE_DOC_ID` | ID do documento modelo no Drive |
| `EVOLUTION_API_URL` | URL base da Evolution API |
| `EVOLUTION_API_KEY` | Chave de autenticação Evolution API |
| `EVOLUTION_INSTANCE` | Nome da instância WhatsApp |
| `WHATSAPP_GROUP_MENTORIA_ID` | JID do grupo (formato: `120363XXXXXX@g.us`) |

---

## 8. Dependências e Pré-Condições

### Infraestrutura necessária antes do deploy

1. **Zoom App (Server-to-Server OAuth)** — criado no Zoom Marketplace com scopes `recording:read:admin` e evento `recording.completed`
2. **Evolution API** — instância rodando com número WhatsApp conectado (Railway recomendado)
3. **Google Doc modelo** — documento com placeholders `{{NOME}}`, `{{DATA}}`, `{{CONTEUDO}}` e identidade visual da Mentoria Sublime
4. **Credenciais N8N** — 4 credenciais configuradas: Zoom Basic Auth, Google Drive OAuth2, Google Docs OAuth2, Evolution API key

### Dependência operacional

- Transcrição automática deve estar **ativada** nas configurações da conta Zoom
- O número WhatsApp conectado na Evolution API deve ser **administrador** do grupo de destino

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Transcrição não disponível no Zoom | Médio | Alto | RF-04: notificação automática de falha |
| Claude API indisponível | Baixo | Alto | N8N retry nativo + logs de erro |
| Token Zoom expirado | Baixo | Médio | OAuth gerado a cada execução (RF-03) |
| Modelo do Drive modificado acidentalmente | Baixo | Alto | Nunca editar o original — sempre duplicar |
| Evolution API desconectada do WhatsApp | Médio | Médio | Monitorar painel Evolution periodicamente |

---

## 10. Critérios de Aceite

- [ ] Reunião Zoom finalizada dispara o workflow automaticamente
- [ ] Resumo gerado segue a estrutura Insights Gerais + Análise Individual
- [ ] Documento no Drive tem nome correto e identidade visual do modelo
- [ ] PDF é gerado e salvo na mesma pasta do Google Doc
- [ ] Mensagem de sucesso chega no grupo de WhatsApp com link do Drive
- [ ] Quando não há transcrição, grupo recebe aviso de falha
- [ ] Nenhuma credencial armazenada diretamente no workflow
- [ ] Tempo total ≤ 10 minutos do fim da reunião ao WhatsApp

---

## 11. Entregáveis

| Arquivo | Localização | Descrição |
|---|---|---|
| `n8n-workflow-mentoria.json` | `mentoria-sublime/` | Workflow N8N pronto para importar |
| `SETUP-WORKFLOW.md` | `mentoria-sublime/` | Guia de configuração passo a passo |
| `prd-automacao-mentoria.md` | `mentoria-sublime/docs/` | Este documento |

---

*— Morgan, planejando o futuro 📊*
