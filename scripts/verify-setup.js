#!/usr/bin/env node
/**
 * verify-setup.js
 * Verifica se todos os pré-requisitos do pipeline Mentoria Sublime estão prontos.
 * Uso: node scripts/verify-setup.js
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

let passed = 0;
let failed = 0;
let warned = 0;

function check(name, status, detail = '') {
  const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️ ' : '❌';
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ''}`);
  if (status === 'pass') passed++;
  else if (status === 'warn') warned++;
  else failed++;
}

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  console.log('\n🔍 Verificação de Setup — Mentoria Sublime Pipeline');
  console.log('='.repeat(52));

  // ── 1. Arquivo de workflow ──────────────────────────────
  console.log('\n📁 Workflow N8N');
  const workflowPath = path.join(__dirname, '..', 'n8n-workflow-mentoria.json');
  if (fs.existsSync(workflowPath)) {
    try {
      const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      const nodeCount = workflow.nodes?.length || 0;
      check('n8n-workflow-mentoria.json', 'pass', `${nodeCount} nós`);

      const requiredNodes = [
        'Zoom Webhook', 'Calcula HMAC SHA256', 'Responde 200 OK',
        'Aguarda 5 Minutos', 'Obtém Token Zoom', 'Tem Transcrição?',
        'WhatsApp — Sem Transcrição', 'Baixa Transcrição VTT',
        'Processa Transcrição VTT', 'Claude — Gera Resumo',
        'Copia Modelo no Drive', 'Substitui Conteúdo no Doc',
        'Exporta PDF do Google Doc', 'Salva PDF no Drive',
        'Envia no Grupo WhatsApp'
      ];
      const nodeNames = (workflow.nodes || []).map(n => n.name);
      const missing = requiredNodes.filter(n => !nodeNames.includes(n));
      if (missing.length === 0) {
        check('Todos os nós críticos presentes', 'pass', `${requiredNodes.length} verificados`);
      } else {
        check('Nós críticos', 'fail', `Faltando: ${missing.join(', ')}`);
      }
    } catch (e) {
      check('n8n-workflow-mentoria.json', 'fail', `JSON inválido: ${e.message}`);
    }
  } else {
    check('n8n-workflow-mentoria.json', 'fail', 'Arquivo não encontrado');
  }

  // ── 2. Variáveis de ambiente ────────────────────────────
  console.log('\n🔐 Variáveis de Ambiente');
  const envVars = [
    'ZOOM_ACCOUNT_ID',
    'ZOOM_WEBHOOK_SECRET_TOKEN',
    'ANTHROPIC_API_KEY',
    'GOOGLE_DRIVE_TEMPLATE_DOC_ID',
    'EVOLUTION_API_URL',
    'EVOLUTION_API_KEY',
    'EVOLUTION_INSTANCE',
    'WHATSAPP_GROUP_MENTORIA_ID',
  ];

  // Tentar carregar .env se existir
  const envPath = path.join(process.env.HOME || '/home/roberto', '.env');
  const localEnvPath = path.join(__dirname, '..', '.env');
  let envLoaded = {};

  for (const p of [envPath, localEnvPath]) {
    if (fs.existsSync(p)) {
      fs.readFileSync(p, 'utf8').split('\n').forEach(line => {
        const [k, ...v] = line.split('=');
        if (k && v.length) envLoaded[k.trim()] = v.join('=').trim();
      });
    }
  }

  for (const varName of envVars) {
    const value = process.env[varName] || envLoaded[varName];
    if (value && value.length > 0) {
      // Mostrar valor parcial para confirmar sem expor
      const preview = value.length > 8
        ? value.substring(0, 4) + '...' + value.substring(value.length - 2)
        : '***';
      check(varName, 'pass', preview);
    } else {
      check(varName, 'fail', 'não configurada');
    }
  }

  // ── 3. Conectividade APIs externas ─────────────────────
  console.log('\n🌐 Conectividade APIs');

  // N8N
  try {
    const r = await httpGet('https://n8n.suellenwarmling.com.br/healthz');
    if (r.status === 200) {
      check('N8N (n8n.suellenwarmling.com.br)', 'pass', 'online');
    } else {
      check('N8N (n8n.suellenwarmling.com.br)', 'warn', `status ${r.status}`);
    }
  } catch (e) {
    check('N8N (n8n.suellenwarmling.com.br)', 'fail', `inacessível: ${e.message}`);
  }

  // Evolution API
  const evolutionUrl = process.env.EVOLUTION_API_URL || envLoaded['EVOLUTION_API_URL'];
  if (evolutionUrl) {
    try {
      const r = await httpGet(`${evolutionUrl}/`);
      check('Evolution API', r.status < 500 ? 'pass' : 'warn', `status ${r.status}`);
    } catch (e) {
      check('Evolution API', 'fail', `inacessível: ${e.message}`);
    }

    // Verificar instância WhatsApp
    const apiKey = process.env.EVOLUTION_API_KEY || envLoaded['EVOLUTION_API_KEY'];
    const instance = process.env.EVOLUTION_INSTANCE || envLoaded['EVOLUTION_INSTANCE'] || 'mentoria-sublime';
    if (apiKey) {
      try {
        const r = await httpGet(
          `${evolutionUrl}/instance/fetchInstances`,
          { apikey: apiKey }
        );
        if (r.status === 200) {
          let data;
          try { data = JSON.parse(r.body); } catch (_) { data = null; }
          const inst = Array.isArray(data)
            ? data.find(i => i.instance?.instanceName === instance)
            : null;
          if (inst) {
            const state = inst.instance?.state || 'unknown';
            const isOpen = state === 'open';
            check(
              `WhatsApp instância "${instance}"`,
              isOpen ? 'pass' : 'warn',
              `estado: ${state}${isOpen ? '' : ' (precisa reconectar)'}`
            );
          } else {
            check(`WhatsApp instância "${instance}"`, 'warn', 'instância não encontrada — criar no painel');
          }
        } else {
          check('WhatsApp instâncias', 'warn', `status ${r.status}`);
        }
      } catch (e) {
        check('WhatsApp instâncias', 'warn', `não verificado: ${e.message}`);
      }
    }
  } else {
    check('Evolution API', 'warn', 'EVOLUTION_API_URL não configurada — pulando');
  }

  // Anthropic API
  const anthropicKey = process.env.ANTHROPIC_API_KEY || envLoaded['ANTHROPIC_API_KEY'];
  if (anthropicKey) {
    try {
      // Apenas verifica se a chave tem o formato correto (sk-ant-...)
      if (anthropicKey.startsWith('sk-ant-')) {
        check('Anthropic API Key', 'pass', 'formato válido');
      } else {
        check('Anthropic API Key', 'warn', 'formato inesperado (esperado sk-ant-...)');
      }
    } catch (e) {
      check('Anthropic API Key', 'warn', e.message);
    }
  } else {
    check('Anthropic API Key', 'fail', 'não configurada');
  }

  // Webhook N8N
  try {
    const r = await httpGet('https://n8n.suellenwarmling.com.br/webhook/zoom-mentoria');
    // 404 = workflow não ativo ainda, 400/405 = endpoint existe mas método errado (normal para GET em webhook POST)
    if (r.status === 404) {
      check('Webhook /zoom-mentoria', 'warn', 'não encontrado — workflow precisa ser importado e ativado (Story 1.5)');
    } else {
      check('Webhook /zoom-mentoria', 'pass', `endpoint respondendo (${r.status})`);
    }
  } catch (e) {
    check('Webhook /zoom-mentoria', 'fail', `N8N inacessível: ${e.message}`);
  }

  // ── 4. Arquivos do projeto ──────────────────────────────
  console.log('\n📂 Arquivos do Projeto');
  const requiredFiles = [
    ['n8n-workflow-mentoria.json', 'Workflow N8N'],
    ['SETUP-WORKFLOW.md', 'Guia de setup'],
    ['docs/prd-automacao-mentoria.md', 'PRD'],
    ['docs/architecture-design.md', 'Architecture Design'],
    ['docs/stories/1.1.story.md', 'Story 1.1'],
    ['docs/stories/1.2.story.md', 'Story 1.2'],
    ['docs/stories/1.3.story.md', 'Story 1.3'],
    ['docs/stories/1.4.story.md', 'Story 1.4'],
    ['docs/stories/1.5.story.md', 'Story 1.5'],
    ['docs/stories/1.6.story.md', 'Story 1.6'],
  ];

  for (const [file, label] of requiredFiles) {
    const p = path.join(__dirname, '..', file);
    check(label, fs.existsSync(p) ? 'pass' : 'fail', file);
  }

  // ── Resumo ──────────────────────────────────────────────
  console.log('\n' + '='.repeat(52));
  console.log(`📊 Resultado: ${passed} passou  ${warned > 0 ? warned + ' aviso  ' : ''}${failed > 0 ? failed + ' falhou' : ''}`);

  if (failed === 0 && warned === 0) {
    console.log('🎉 Sistema pronto para ativação!');
  } else if (failed === 0) {
    console.log('⚠️  Verifique os avisos antes de ativar o workflow.');
  } else {
    console.log(`❌ Corrija os ${failed} erro(s) antes de prosseguir.`);
    console.log('\nPróximos passos:');
    console.log('  1. Execute as Stories 1.1 → 1.2 → 1.3 (paralelas)');
    console.log('  2. Execute Story 1.4 (credenciais N8N)');
    console.log('  3. Execute Story 1.5 (importar workflow)');
    console.log('  4. Execute este script novamente para confirmar');
    console.log('  5. Execute Story 1.6 (teste end-to-end)');
  }
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Erro inesperado:', e.message);
  process.exit(1);
});
