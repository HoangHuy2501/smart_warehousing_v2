const sql = require('mssql');
const env = require('./env');
let poolPromise;
async function getPool() {
  if (env.mock) throw new Error('Mock mode không dùng SQL Server');
  if (!poolPromise) poolPromise = new sql.ConnectionPool(env.db).connect().catch(err => { poolPromise = null; throw err; });
  return poolPromise;
}
async function closePool() { if (poolPromise) { const pool = await poolPromise; await pool.close(); poolPromise = null; } }
module.exports = { sql, getPool, closePool };
