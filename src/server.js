const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const pool = require('./config/database');
const sincronizarCompatibilidadeBanco = require('./database/sync');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS (para Live Server na porta 5500 ou outras origens)
app.use(cors());

// Parser para corpo das requisições em JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (HTML, CSS, JS, imagens)
const rootPath = path.join(__dirname, '..');
app.use(express.static(rootPath));

// Rotas da API
app.use(routes);

// Rota raiz padrão redirecionando para login ou index
app.get('/', (req, res) => {
  res.sendFile(path.join(rootPath, 'login.html'));
});

// Middleware global de tratamento de erros (incluindo RNF07 - FK 1451)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(` Servidor Pilhadão Açaí rodando na porta ${PORT}`);
  console.log(` Acesse: http://localhost:${PORT}`);
  console.log(`=================================================`);

  // Teste de conexão não bloqueante com o banco MySQL e sincronização
  try {
    const conn = await pool.getConnection();
    console.log(' Conectado com sucesso ao banco MySQL (db_trabalho)!');
    conn.release();
    // Executa checagem e padronização automática de compatibilidade
    await sincronizarCompatibilidadeBanco();
  } catch (err) {
    console.warn(' Aviso: Não foi possível conectar ao MySQL de imediato.');
    console.warn(' Detalhes:', err.message);
    console.warn(' Certifique-se de que o MySQL está em execução e o banco db_trabalho foi criado.');
  }
});

module.exports = app;
