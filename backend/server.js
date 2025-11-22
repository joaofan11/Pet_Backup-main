// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <- IMPORTE O 'path'

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: [
    'https://petplus.onrender.com', // Seu frontend no Render
    'http://localhost:3000',
    'http://localhost:5500'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parser para JSON

// Isso faz com que a URL http://localhost:3001/uploads/nome-da-imagem.png funcione
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/services', require('./routes/services'));
app.use('/api/blog', require('./routes/blog'));

// Rota de "saúde" da API
app.get('/api', (req, res) => {
  res.send('API PetPlus V1.0 funcionando!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`=====================Servidor rodando em http://localhost:${port}========================== Bem Vindo Ao Petplus
    `);

});
