const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function runSeed() {
  console.log('===========================================================');
  console.log('   Iniciando Configuração e Carga de Dados no MySQL');
  console.log('===========================================================');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
  } catch (connErr) {
    console.error('\n❌ ERRO DE CONEXÃO COM O MYSQL:');
    console.error(`   Não foi possível conectar ao servidor MySQL em ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.error(`   Detalhe: ${connErr.code || connErr.message}\n`);
    console.error('👉 O QUE FAZER:');
    console.error('   1. Inicie o MySQL (pelo MySQL Workbench, XAMPP, WampServer ou Docker).');
    console.error('   2. Verifique se as credenciais no arquivo .env (DB_USER, DB_PASSWORD, DB_PORT) estão corretas.');
    process.exit(1);
  }

  try {
    const caminhoAcaiteria = path.join(__dirname, '..', '..', 'banco_acaiteria.sql');
    const caminhoDDL = path.join(__dirname, '..', '..', 'scriptDDL.sql');

    if (fs.existsSync(caminhoAcaiteria)) {
      console.log('📦 Arquivo [banco_acaiteria.sql] localizado!');
      console.log('⏳ Executando script completo (DDL + 100 Produtos + 100 Movimentações + Fornecedores)...');

      const sqlContent = fs.readFileSync(caminhoAcaiteria, 'utf8');
      await connection.query(sqlContent);
      console.log('✓ Script banco_acaiteria.sql executado com sucesso no MySQL!');
    } else if (fs.existsSync(caminhoDDL)) {
      console.log('📄 Executando script DDL base...');
      const sqlContent = fs.readFileSync(caminhoDDL, 'utf8');
      await connection.query(sqlContent);
    }

    // Seleciona a base
    await connection.query('USE `db_trabalho`;');

    // 1. Padronizar coluna quantidadeEstoque -> quantidade_estoque se necessário
    const [colQtd] = await connection.query("SHOW COLUMNS FROM produto LIKE 'quantidadeEstoque'");
    if (colQtd.length > 0) {
      await connection.query(`
        ALTER TABLE produto 
        CHANGE COLUMN quantidadeEstoque quantidade_estoque DECIMAL(10,2) NOT NULL DEFAULT 0.00
      `);
      console.log('✓ Coluna produto.quantidade_estoque padronizada.');
    }

    // 2. Padronizar coluna codigo_sku_furnecedor -> codigo_sku_fornecedor se necessário
    const [colSku] = await connection.query("SHOW COLUMNS FROM produto_fornecedor LIKE 'codigo_sku_furnecedor'");
    if (colSku.length > 0) {
      await connection.query(`
        ALTER TABLE produto_fornecedor 
        CHANGE COLUMN codigo_sku_furnecedor codigo_sku_fornecedor VARCHAR(30) NOT NULL
      `);
      console.log('✓ Coluna produto_fornecedor.codigo_sku_fornecedor padronizada.');
    }

    // 3. Expandir coluna usuario.senha para VARCHAR(255) para suportar bcrypt
    await connection.query('ALTER TABLE usuario MODIFY COLUMN senha VARCHAR(255) NOT NULL');
    console.log('✓ Coluna usuario.senha ajustada para VARCHAR(255).');

    // 4. Criptografar senhas existentes com bcrypt (RNF06)
    const [usuarios] = await connection.query('SELECT idusuario, nome_usuario, login, senha FROM usuario');
    for (const u of usuarios) {
      if (!u.senha.startsWith('$2a$') && !u.senha.startsWith('$2b$')) {
        const hash = await bcrypt.hash(u.senha, 10);
        await connection.query('UPDATE usuario SET senha = ? WHERE idusuario = ?', [hash, u.idusuario]);
        console.log(`🔒 Senha do usuário "${u.login}" criptografada com hash bcrypt (RNF06).`);
      }
    }

    // 5. Garantir que o usuário Danilo (Gerente) também exista para testes
    const [danilo] = await connection.query("SELECT * FROM usuario WHERE login = 'danilo.gerente'");
    if (danilo.length === 0) {
      const senhaDanilo = await bcrypt.hash('123456', 10);
      await connection.query(
        "INSERT INTO usuario (nome_usuario, cargo, login, senha) VALUES ('Danilo Bittencourt', 'Gerente', 'danilo.gerente', ?)",
        [senhaDanilo]
      );
      console.log('✓ Usuário "danilo.gerente" (senha: 123456) cadastrado com sucesso!');
    }

    // Resumo dos dados carregados
    const [[{ total_produtos }]] = await connection.query('SELECT COUNT(*) AS total_produtos FROM produto');
    const [[{ total_categorias }]] = await connection.query('SELECT COUNT(*) AS total_categorias FROM categoria');
    const [[{ total_fornecedores }]] = await connection.query('SELECT COUNT(*) AS total_fornecedores FROM fornecedor');
    const [[{ total_movimentacoes }]] = await connection.query('SELECT COUNT(*) AS total_movimentacoes FROM movimentacao');

    console.log('\n===========================================================');
    console.log('   🎉 BANCO DE DADOS INTEGRADO COM SUCESSO!');
    console.log('===========================================================');
    console.log(` • Categorias cadastradas: ${total_categorias}`);
    console.log(` • Produtos no catálogo:   ${total_produtos}`);
    console.log(` • Fornecedores parceiros: ${total_fornecedores}`);
    console.log(` • Movimentações em log:   ${total_movimentacoes}`);
    console.log('\n🔑 USUÁRIOS DISPONÍVEIS PARA LOGIN:');
    console.log(' • Login: carlos.gerente  | Senha: acai123 (Gerente)');
    console.log(' • Login: ana.atend       | Senha: acai123 (Atendente)');
    console.log(' • Login: marcos.estoque  | Senha: acai123 (Estoquista)');
    console.log(' • Login: danilo.gerente  | Senha: 123456  (Gerente)');
    console.log('===========================================================\n');

  } catch (err) {
    console.error('❌ Erro durante a integração do banco de dados:', err);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
