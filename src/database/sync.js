const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Função de sincronização automática de compatibilidade do banco.
 * Garante que tanto o scriptDDL quanto o banco_acaiteria.sql funcionem perfeitamente.
 */
async function sincronizarCompatibilidadeBanco() {
  try {
    const conn = await pool.getConnection();

    try {
      // 1. Verificar se a tabela produto existe
      const [tabelas] = await conn.query("SHOW TABLES LIKE 'produto'");
      if (tabelas.length === 0) {
        conn.release();
        return;
      }

      // 2. Verificar coluna quantidadeEstoque -> quantidade_estoque
      const [colunasProduto] = await conn.query("SHOW COLUMNS FROM produto LIKE 'quantidadeEstoque'");
      if (colunasProduto.length > 0) {
        console.log('🔄 Padronizando coluna produto.quantidadeEstoque para quantidade_estoque...');
        await conn.query(`
          ALTER TABLE produto 
          CHANGE COLUMN quantidadeEstoque quantidade_estoque DECIMAL(10,2) NOT NULL DEFAULT 0.00
        `);
        console.log('✓ Coluna quantidade_estoque padronizada com sucesso.');
      }

      // 3. Verificar coluna codigo_sku_furnecedor -> codigo_sku_fornecedor
      const [colunasPF] = await conn.query("SHOW COLUMNS FROM produto_fornecedor LIKE 'codigo_sku_furnecedor'");
      if (colunasPF.length > 0) {
        console.log('🔄 Padronizando coluna produto_fornecedor.codigo_sku_furnecedor para codigo_sku_fornecedor...');
        await conn.query(`
          ALTER TABLE produto_fornecedor 
          CHANGE COLUMN codigo_sku_furnecedor codigo_sku_fornecedor VARCHAR(30) NOT NULL
        `);
        console.log('✓ Coluna codigo_sku_fornecedor padronizada com sucesso.');
      }

      // 4. Garantir que usuario.senha suporte hash bcrypt (VARCHAR(255))
      const [colunasUsuario] = await conn.query("SHOW COLUMNS FROM usuario LIKE 'senha'");
      if (colunasUsuario.length > 0 && colunasUsuario[0].Type.includes('varchar(45)')) {
        console.log('🔄 Expandindo coluna usuario.senha para VARCHAR(255) para suportar bcrypt...');
        await conn.query('ALTER TABLE usuario MODIFY COLUMN senha VARCHAR(255) NOT NULL');
        console.log('✓ Coluna usuario.senha atualizada para VARCHAR(255).');
      }

      // 5. Criptografar com bcrypt qualquer senha em texto puro existente no banco (ex: 'acai123')
      const [usuarios] = await conn.query('SELECT idusuario, senha FROM usuario');
      for (const u of usuarios) {
        if (!u.senha.startsWith('$2a$') && !u.senha.startsWith('$2b$')) {
          const hash = await bcrypt.hash(u.senha, 10);
          await conn.query('UPDATE usuario SET senha = ? WHERE idusuario = ?', [hash, u.idusuario]);
          console.log(`🔒 Senha do usuário ID ${u.idusuario} criptografada com bcrypt (RNF06).`);
        }
      }

    } finally {
      conn.release();
    }
  } catch (err) {
    // Se o banco ainda não estiver criado ou offline, não interrompe a inicialização
    console.warn('ℹ️ Verificação de compatibilidade concluída ou banco ainda não conectado:', err.message);
  }
}

module.exports = sincronizarCompatibilidadeBanco;
