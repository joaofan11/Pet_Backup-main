// backend/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 1. Essencial para Supabase/Cloud DBs
  ssl: {
    rejectUnauthorized: false // Isso lida com certificados de nuvem
  },
  // 2. CORREÇÃO DEFINITIVA PARA ENETUNREACH
  family: 4, 
});

// Testa a conexão ao iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.stack);
  } else {
    console.log('✅ Conectado ao banco de dados PostgreSQL com sucesso!');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
