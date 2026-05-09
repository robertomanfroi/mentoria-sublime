# Setup — Workflow Mentoria Sublime (uma vez só)

> Reunião termina → 7 minutos → resumo no Drive + mensagem no grupo do WhatsApp

## O que o workflow faz automaticamente
Toda vez que uma reunião do Zoom terminar e tiver transcrição:
1. Aguarda 5 minutos (transcrição ficar pronta)
2. Baixa a transcrição do Zoom
3. Manda para o Claude gerar o resumo estruturado
4. Duplica o modelo do Google Drive
5. Substitui o conteúdo pelo resumo
6. Avisa no Telegram que está pronto

---

## PASSO 1 — Preparar o modelo no Google Drive

No documento modelo da Mentoria Sublime, adicione 3 placeholders onde o conteúdo deve ser inserido:

- Onde vai o nome da mentorada → escreva: `{{NOME}}`
- Onde vai a data → escreva: `{{DATA}}`
- Onde vai o resumo completo → escreva: `{{CONTEUDO}}`

Depois pegue o ID do documento:
- ID já identificado: `1TbVI_xvCfTn6NC4cqmm09_P9LZOV8kmd`
- Link: https://docs.google.com/document/d/1TbVI_xvCfTn6NC4cqmm09_P9LZOV8kmd/edit

---

## PASSO 2 — Criar App no Zoom (para acesso à API)

1. Acesse: https://marketplace.zoom.us/
2. Clique em "Develop" → "Build App"
3. Escolha tipo: **Server-to-Server OAuth**
4. Ative estas permissões (scopes):
   - `recording:read:admin`
   - `recording:read`
5. Em "Event Subscriptions", adicione evento: `recording.completed`
6. A URL do webhook vai ser: `https://n8n.suellenwarmling.com.br/webhook/zoom-mentoria`
7. Ative o app
8. Anote: **Account ID**, **Client ID**, **Client Secret**, **Secret Token**

---

## PASSO 3 — Configurar credenciais no N8N

Acesse: https://n8n.suellenwarmling.com.br → Settings → Credentials

### 3a. Criar credencial HTTP Basic Auth (para Zoom)
- Nome: `Zoom Client ID e Secret`
- Tipo: `HTTP Basic Auth`
- User: cole o **Client ID** do Zoom
- Password: cole o **Client Secret** do Zoom

### 3b. Criar credenciais Google OAuth2 (Drive + Docs — duas separadas)

> ⚠️ N8N exige dois registros de credencial distintos, mesmo sendo a mesma conta Google.

**Credencial 1:**
- Nome: `Google Drive OAuth2`
- Tipo: `Google Drive OAuth2 API`
- Autenticar com a conta Google da Suellen

**Credencial 2:**
- Nome: `Google Docs OAuth2`
- Tipo: `Google Docs OAuth2 API`
- Autenticar com a **mesma conta** Google da Suellen

Ambas aparecerão no fluxo — cada nó usa o tipo correspondente.

### 3c. Configurar Evolution API (WhatsApp)

**3c.1 — Instalar Evolution API no Railway**

1. Acesse: https://railway.app
2. New Project → Deploy from GitHub → busque `EvolutionAPI/evolution-api`
   - Ou use o template oficial: https://railway.app/template/evolution-api
3. Após deploy, anote a URL pública (ex: `https://evolution-xxx.up.railway.app`)
4. A API Key padrão é `B6D711FCDE4D4FD5936544120E713976` — troque por uma sua

**3c.2 — Conectar o número do WhatsApp**

1. Acesse: `https://sua-evolution-api.up.railway.app/manager`
2. Crie uma instância (ex: `mentoria-sublime`)
3. Clique em "Connect" → escaneie o QR Code com o WhatsApp da Suellen
4. Aguarde conectar

**3c.3 — Pegar o ID do grupo de WhatsApp**

1. No painel da Evolution API, vá em: Instances → mentoria-sublime → Groups
2. Encontre o grupo "Mentoria Sublime" e copie o ID (formato: `120363XXXXXXXXXX@g.us`)

---

## PASSO 4 — Configurar variáveis de ambiente no N8N

Acesse: https://n8n.suellenwarmling.com.br → Settings → Environment Variables

Adicionar estas variáveis:

| Variável | Valor |
|---|---|
| `ZOOM_ACCOUNT_ID` | Account ID do app Zoom |
| `ZOOM_WEBHOOK_SECRET_TOKEN` | Secret Token do app Zoom |
| `ANTHROPIC_API_KEY` | sk-ant-... (está em /home/roberto/.env) |
| `GOOGLE_DRIVE_TEMPLATE_DOC_ID` | `1TbVI_xvCfTn6NC4cqmm09_P9LZOV8kmd` |
| `EVOLUTION_API_URL` | URL da sua Evolution API (ex: https://evolution-xxx.up.railway.app) |
| `EVOLUTION_API_KEY` | API Key da Evolution API |
| `EVOLUTION_INSTANCE` | Nome da instância criada (ex: mentoria-sublime) |
| `WHATSAPP_GROUP_MENTORIA_ID` | ID do grupo (ex: 120363XXXXXXXXXX@g.us) |

---

## PASSO 5 — Importar e ativar o workflow

1. No N8N: Workflows → Import from file
2. Selecionar: `n8n-workflow-mentoria.json`
3. Abrir o workflow importado
4. Mapear credenciais nos nós (N8N vai pedir na primeira abertura)
5. Clicar em **Activate** (toggle no canto superior direito)

---

## Teste rápido

Após ativar, faça uma reunião de teste no Zoom com 2-3 minutos de conversa.
O resumo vai aparecer no Drive em ~7 minutos após o fim da reunião.

---

## Onde fica o arquivo no Drive

Pasta: https://drive.google.com/drive/folders/1si0pPBrHXbxUCz6TN1uH-EF39Md5n7Xs

Nome do arquivo: `Resumo Mentoria Sublime - [Nome] - [Data]`
