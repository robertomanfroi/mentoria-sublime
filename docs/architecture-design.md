# Architecture Design — Automação Mentoria Sublime

**Projeto:** Workflow de Automação de Resumos
**Arquiteta:** Aria
**Versão:** 1.0
**Data:** 08 de maio de 2026
**Referência PRD:** `docs/prd-automacao-mentoria.md`

---

## 1. Visão Arquitetural

### Estilo Arquitetural

**Event-Driven Pipeline** — o sistema é inteiramente orientado a eventos. O evento `recording.completed` do Zoom dispara uma cadeia determinística de etapas, cada uma com entrada e saída bem definidas. Não há polling, não há estado persistido entre execuções, e cada run é idempotente por design.

### Princípios Aplicados

| Princípio | Decisão |
|---|---|
| Simplicidade operacional | N8N como único orquestrador — sem microserviços extras |
| Stateless por execução | Cada run carrega tudo do Zoom/Claude/Drive sem estado local |
| Falha visível | Qualquer erro gera notificação WhatsApp — nada silencioso |
| Credenciais via ambiente | Zero secrets no código ou no workflow JSON |
| Idempotência | Re-run do mesmo evento gera novo documento sem sobrescrever |

---

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     SISTEMAS EXTERNOS                            │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │   ZOOM   │    │  CLAUDE API  │    │   GOOGLE WORKSPACE   │   │
│  │  Cloud   │    │  Anthropic   │    │  Drive + Docs APIs   │   │
│  └────┬─────┘    └──────┬───────┘    └──────────┬───────────┘   │
│       │                 │                        │               │
└───────┼─────────────────┼────────────────────────┼───────────────┘
        │                 │                        │
        ▼                 │                        │
┌─────────────────────────────────────────────────────────────────┐
│                     N8N ORCHESTRATOR                             │
│              (n8n.suellenwarmling.com.br)                        │
│                                                                 │
│  [Webhook] → [Validação] → [Wait 5min] → [Auth Zoom]           │
│      → [Download VTT] → [Parse] → [Claude] → [Format]          │
│      → [Copy Drive] → [Update Doc] → [Export PDF]              │
│      → [Upload PDF] → [WhatsApp ✅]                             │
│                                                                 │
│  Falha: qualquer etapa → [WhatsApp ⚠️]                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EVOLUTION API (WhatsApp)                        │
│              (evolution-xxx.up.railway.app)                      │
│                                                                 │
│  Instância: mentoria-sublime                                    │
│  Destino: grupo WhatsApp ID @g.us                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitetura do Pipeline (Etapas)

### Fase 1 — Ingesta (Zoom → N8N)

```
Zoom Cloud Recording
    │ POST /webhook/zoom-mentoria
    ▼
[Webhook Node]
    │ responseMode: responseNode (async)
    ▼
[IF: URL Validation?] ──TRUE──► [HMAC SHA256] ──► [Respond validation JSON]
    │ FALSE
    ▼
[IF: recording.completed?] ──FALSE──► [Respond 200 — ignorar]
    │ TRUE
    ▼
[Set: extrai meetingId, topic, startTime, transcriptUrl, downloadToken]
    │
    ▼
[Respond 200 OK] ──► continua assíncrono
    │
    ▼
[Wait: 5 minutos]
```

**Decisão arquitetural:** responder 200 OK imediatamente e processar async é obrigatório. Zoom cancela webhooks que demoram > 3s para responder.

### Fase 2 — Obtenção de Dados (Zoom API)

```
[HTTP: POST zoom.us/oauth/token]
    │ grant_type=account_credentials
    │ Basic Auth: Client ID + Client Secret
    ▼
access_token (válido 1h)
    │
    ▼
[IF: transcriptUrl não vazio?]
    │ FALSE ──► [WhatsApp: aviso sem transcrição] ──► FIM
    │ TRUE
    ▼
[HTTP: GET transcriptDownloadUrl]
    │ Authorization: Bearer {access_token}
    │ responseFormat: text
    ▼
arquivo .vtt (WebVTT format)
```

### Fase 3 — Processamento IA (Claude)

```
[Code: parse VTT]
    │ Remove: WEBVTT, timestamps (HH:MM:SS.mmm --> HH:MM:SS.mmm), índices
    │ Mantém: linhas de texto puro com speaker + conteúdo
    │ Formata: data em português
    ▼
transcript (texto limpo)
    │
    ▼
[HTTP: POST api.anthropic.com/v1/messages]
    │ model: claude-sonnet-4-6
    │ max_tokens: 8000
    │ prompt: estrutura Insights Gerais + Análise Individual
    │ instrução final: linha "NOME_REUNIAO: [nome]"
    ▼
[Code: formata resposta]
    │ Extrai NOME_REUNIAO da última linha
    │ Separa resumoContent do marcador
    │ Monta docName: "Resumo Mentoria Sublime - {NOME} - {DATA}"
    ▼
{ resumoContent, nomeCurto, dateFormatted, docName }
```

### Fase 4 — Geração do Documento (Google Workspace)

```
[Google Drive: copy file]
    │ source: GOOGLE_DRIVE_TEMPLATE_DOC_ID
    │ name: docName
    │ folder: 1si0pPBrHXbxUCz6TN1uH-EF39Md5n7Xs
    ▼
{ id: newDocId }
    │
    ▼
[HTTP: POST docs.googleapis.com/v1/documents/{id}:batchUpdate]
    │ replaceAllText: {{NOME}} → nomeCurto
    │ replaceAllText: {{DATA}} → dateFormatted
    │ replaceAllText: {{CONTEUDO}} → resumoContent
    ▼
Google Doc formatado
    │
    ▼
[HTTP: GET drive.googleapis.com/v3/files/{id}/export?mimeType=application/pdf]
    │ responseFormat: file → pdfData (binary)
    ▼
[Google Drive: upload]
    │ name: docName + ".pdf"
    │ folder: mesma pasta
    │ binaryPropertyName: pdfData
    ▼
Google Doc + PDF salvos na pasta Drive
```

### Fase 5 — Notificação (Evolution API → WhatsApp)

```
[HTTP: POST {EVOLUTION_API_URL}/message/sendText/{INSTANCE}]
    │ apikey: EVOLUTION_API_KEY
    │ number: WHATSAPP_GROUP_MENTORIA_ID (@g.us)
    │ text: mensagem formatada com nome + arquivo + link Drive
    ▼
✅ Mensagem entregue no grupo
```

---

## 4. Modelo de Segurança

### Autenticação por Serviço

| Serviço | Método | Onde configurado |
|---|---|---|
| Zoom Webhook | HMAC SHA256 validado a cada request | `ZOOM_WEBHOOK_SECRET_TOKEN` env var |
| Zoom API | Server-to-Server OAuth (token por execução) | `ZOOM_ACCOUNT_ID` + Basic Auth |
| Claude API | API Key no header `x-api-key` | `ANTHROPIC_API_KEY` env var |
| Google Drive | OAuth2 token gerenciado pelo N8N | Credencial N8N (renovação automática) |
| Google Docs | OAuth2 token gerenciado pelo N8N | Credencial N8N separada (mesmo escopo) |
| Evolution API | API Key no header `apikey` | `EVOLUTION_API_KEY` env var |

### Regras de Segurança

1. **Nenhuma credencial** no workflow JSON exportado
2. **Todas as secrets** via variáveis de ambiente do N8N
3. **HMAC validation** em todo webhook recebido do Zoom
4. **OAuth tokens** nunca persistidos — gerados por execução ou gerenciados pelo N8N
5. **Modelo template** no Drive: nunca exposto publicamente, apenas duplicado

---

## 5. Infraestrutura e Deploy

### Componentes e Hospedagem

| Componente | Plataforma | URL | Responsabilidade |
|---|---|---|---|
| N8N | VPS própria | n8n.suellenwarmling.com.br | Orquestração do pipeline |
| Evolution API | Railway | evolution-xxx.up.railway.app | Gateway WhatsApp |
| Zoom App | Zoom Marketplace | — | Webhook + Recording API |
| Claude API | Anthropic Cloud | api.anthropic.com | Geração do resumo |
| Google Drive/Docs | Google Cloud | — | Armazenamento e doc |

### Dependências de Runtime

```
N8N (sempre online)
  └── requer: HTTPS endpoint público (para Zoom webhook)
  └── requer: acesso de saída para APIs externas

Evolution API (sempre online)
  └── requer: número WhatsApp conectado e sessão ativa
  └── requer: ser admin do grupo destino

Zoom (conta configurada)
  └── requer: transcrição automática ativada na conta
  └── requer: Server-to-Server App ativo com scopes corretos
```

### SLA e Disponibilidade

| Componente | SLA esperado | Impacto se cair |
|---|---|---|
| N8N | 99%+ (infraestrutura própria) | Pipeline para completamente |
| Evolution API | 99%+ (Railway) | Resumo gerado mas não notificado |
| Zoom API | 99.9% (SLA Zoom) | Download de transcrição falha |
| Claude API | 99.9% (SLA Anthropic) | Resumo não gerado |
| Google Drive API | 99.9% (SLA Google) | Documento não criado |

---

## 6. Modelo de Dados em Trânsito

### Payload Zoom → N8N

```json
{
  "event": "recording.completed",
  "payload": {
    "object": {
      "id": "MEETING_ID",
      "topic": "Mentoria Sublime — Sessão 12",
      "start_time": "2026-05-08T14:00:00Z",
      "recording_files": [
        {
          "file_type": "TRANSCRIPT",
          "file_extension": "VTT",
          "download_url": "https://zoom.us/rec/download/...",
          "status": "completed"
        }
      ]
    },
    "download_token": "JWT_TOKEN"
  }
}
```

### Claude Input/Output

```
INPUT:
  - transcript: string (texto VTT parseado)
  - meetingTopic: string
  - dateFormatted: string

OUTPUT esperado:
  - Seção 1: ## Insights Gerais...
  - Seção 2: ### Nome Mentorada...
  - Última linha: NOME_REUNIAO: NomeCurto
```

### Google Doc — Placeholders

```
Template contém:
  {{NOME}}     → nome curto da reunião/mentorada principal
  {{DATA}}     → "8 de maio de 2026"
  {{CONTEUDO}} → resumo completo gerado pelo Claude
```

---

## 7. Tratamento de Erros

### Estratégia

Todos os erros são **visíveis** — nada falha silenciosamente.

| Cenário de Erro | Comportamento |
|---|---|
| Reunião sem transcrição | Nó dedicado envia WhatsApp de aviso e encerra |
| Claude API timeout/erro | N8N retry nativo (3x) + log de execução |
| Google Drive/Docs erro | N8N retry nativo + log |
| Evolution API erro | Notificação perdida — monitorar logs N8N |
| Zoom token expirado | Impossível — token é obtido fresco a cada execução |

### Monitoramento

- **Execuções N8N:** painel em n8n.suellenwarmling.com.br → Executions
- **Evolution API:** painel manager em evolution-xxx.up.railway.app
- **Alertas:** qualquer execução com erro aparece como failed no N8N

---

## 8. Stories para @sm

Com base nesta arquitetura, as seguintes stories de implementação são necessárias:

### Epic: Automação Resumos Mentoria Sublime

| # | Story | Agente | Estimativa |
|---|---|---|---|
| 1.1 | Setup infraestrutura Evolution API no Railway | @devops | S |
| 1.2 | Configurar Zoom Server-to-Server App + webhook | @devops | S |
| 1.3 | Preparar documento modelo Google Docs com placeholders | @dev | S |
| 1.4 | Configurar credenciais e env vars no N8N | @devops | S |
| 1.5 | Importar e ativar workflow N8N | @dev | S |
| 1.6 | Teste end-to-end com reunião real | @qa | M |

> **Nota para @sm:** cada story deve ter critérios de aceite verificáveis e ser independente das demais (exceto dependência sequencial 1.1 → 1.2 → 1.4 → 1.5 → 1.6).

---

## 9. Decisões Arquiteturais (ADRs)

### ADR-01: N8N como único orquestrador
- **Decisão:** usar N8N já existente em vez de criar serviço custom
- **Motivo:** zero infraestrutura nova, visual workflow editor, retry nativo
- **Trade-off:** depende de uptime do servidor N8N existente

### ADR-02: Claude Sonnet 4.6 para geração
- **Decisão:** `claude-sonnet-4-6` com 8000 tokens de output
- **Motivo:** capacidade de análise de transcrições longas com estrutura complexa
- **Trade-off:** custo por execução ~$0.02-0.05 por sessão

### ADR-03: Google Docs como formato master, PDF derivado
- **Decisão:** criar Google Doc primeiro, exportar PDF via API
- **Motivo:** Google Doc é editável pós-geração se necessário; PDF é apenas distribuição
- **Trade-off:** requer dois tipos de credencial Google no N8N

### ADR-04: Evolution API para WhatsApp
- **Decisão:** Evolution API auto-hospedada no Railway
- **Motivo:** gratuito, N8N integra via HTTP, controle total da sessão
- **Trade-off:** número WhatsApp precisa ser mantido conectado

### ADR-05: Sem banco de dados local
- **Decisão:** sistema completamente stateless — sem DB no N8N
- **Motivo:** cada execução é independente; histórico fica no Drive e no Zoom
- **Trade-off:** sem histórico de execuções além dos logs N8N

---

*— Aria, arquitetando o futuro 🏗️*

**→ Handoff para @sm:** architecture design concluído. Stories mapeadas na Seção 8. Próxima etapa: criar stories com critérios de aceite detalhados.
