const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

let client;

if (process.env.TURSO_DATABASE_URL) {
  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
} else {
  const dbPath = path.join(__dirname, '../../data/mentoria.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  client = createClient({ url: `file:${dbPath}` });
}

function convertRow(row) {
  if (!row) return null;
  const obj = {};
  for (const [key, val] of Object.entries(row)) {
    obj[key] = typeof val === 'bigint' ? Number(val) : val;
  }
  return obj;
}

function flattenArgs(args) {
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

function prepare(sql) {
  return {
    async all(...args) {
      const result = await client.execute({ sql, args: flattenArgs(args) });
      return result.rows.map(convertRow);
    },
    async get(...args) {
      const result = await client.execute({ sql, args: flattenArgs(args) });
      return convertRow(result.rows[0]) || null;
    },
    async run(...args) {
      const result = await client.execute({ sql, args: flattenArgs(args) });
      return {
        lastInsertRowid: result.lastInsertRowid ? Number(result.lastInsertRowid) : null,
        changes: result.rowsAffected,
      };
    },
  };
}

async function execRaw(sql) {
  await client.execute(sql);
}

/**
 * Executa múltiplos statements em transação atômica.
 * @param {Array<{sql: string, args?: any[]}>} statements
 */
async function executeTransaction(statements) {
  const tx = await client.transaction('write');
  try {
    for (const { sql, args = [] } of statements) {
      await tx.execute({ sql, args });
    }
    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

module.exports = { prepare, execRaw, executeTransaction };
