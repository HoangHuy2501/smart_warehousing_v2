require('dotenv').config();
const mock = process.env.USE_MOCK !== 'false';
if (!mock && (!process.env.DB_SERVER || !process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD)) {
  throw new Error('Thiếu cấu hình DB_SERVER / DB_NAME / DB_USER / DB_PASSWORD');
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('CHANGE_THIS')) {
  throw new Error('Hãy cấu hình JWT_SECRET mạnh (>=32 ký tự) trong .env');
}
module.exports = {
  mock, port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  db: {
    server: process.env.DB_SERVER || 'localhost', port: Number(process.env.DB_PORT || 1433),
    database: process.env.DB_NAME || 'BaseBE', user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    options: { encrypt: process.env.DB_ENCRYPT === 'true', trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  }
};
