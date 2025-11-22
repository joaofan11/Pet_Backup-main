// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// CORS - Permitir TODOS os domínios (você pode restringir depois)
app.use(cors({
  origin: [
    'https://petplus.onrender.com', // ⚠️ Sua URL do frontend
    'http://localhost:3000', // Para desenvolvimento local
    'http://localhost:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/services', require('./routes/services'));
app.use('/api/blog', require('./routes/blog'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'API PetPlus Online! 🐾' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API PetPlus V1.0 funcionando!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});


