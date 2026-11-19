const db = require('../config/database');

class FornecedorModel {
  static async listarTodos({ busca } = {}) {
    let sql = `
      SELECT 
        f.idfornecedor,
        f.endereco_idendereco,
        f.nome,
        f.cnpj,
        f.telefone,
        f.email,
        f.nome_contato,
        e.cidade,
        e.uf,
        e.pais,
        e.cep,
        e.logradouro,
        e.numero,
        e.bairro,
        e.complemento
      FROM fornecedor f
      INNER JOIN endereco e ON f.endereco_idendereco = e.idendereco
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      sql += ' AND (f.nome LIKE ? OR f.cnpj LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }

    sql += ' ORDER BY f.nome ASC';

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async buscarPorId(id) {
    const sql = `
      SELECT 
        f.idfornecedor,
        f.endereco_idendereco,
        f.nome,
        f.cnpj,
        f.telefone,
        f.email,
        f.nome_contato,
        e.cidade,
        e.uf,
        e.pais,
        e.cep,
        e.logradouro,
        e.numero,
        e.bairro,
        e.complemento
      FROM fornecedor f
      INNER JOIN endereco e ON f.endereco_idendereco = e.idendereco
      WHERE f.idfornecedor = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Conforme especificação da Página 9 do PDF:
   * Cria primeiro o endereço, obtém o idendereco gerado e salva o fornecedor com a FK gerada.
   * Utiliza transação para garantir integridade.
   */
  static async criarComEndereco(dados) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Inserir na tabela endereco
      const sqlEndereco = `
        INSERT INTO endereco (
          cidade, uf, pais, cep, logradouro, numero, bairro, complemento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [resEndereco] = await connection.query(sqlEndereco, [
        dados.cidade,
        dados.uf,
        dados.pais || 'Brasil',
        dados.cep,
        dados.logradouro,
        dados.numero,
        dados.bairro,
        dados.complemento || null
      ]);

      const idendereco = resEndereco.insertId;

      // 2. Inserir na tabela fornecedor
      const sqlFornecedor = `
        INSERT INTO fornecedor (
          endereco_idendereco, nome, cnpj, telefone, email, nome_contato
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [resFornecedor] = await connection.query(sqlFornecedor, [
        idendereco,
        dados.nome,
        dados.cnpj,
        dados.telefone,
        dados.email || '',
        dados.nome_contato || ''
      ]);

      await connection.commit();

      return {
        idfornecedor: resFornecedor.insertId,
        endereco_idendereco: idendereco
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Atualiza simultaneamente fornecedor e endereço vinculado em transação
   */
  static async atualizarComEndereco(idfornecedor, dados) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Buscar idendereco vinculado
      const [rows] = await connection.query(
        'SELECT endereco_idendereco FROM fornecedor WHERE idfornecedor = ?',
        [idfornecedor]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return false;
      }

      const idendereco = rows[0].endereco_idendereco;

      // Atualiza fornecedor
      await connection.query(
        `UPDATE fornecedor SET
          nome = ?, cnpj = ?, telefone = ?, email = ?, nome_contato = ?
        WHERE idfornecedor = ?`,
        [dados.nome, dados.cnpj, dados.telefone, dados.email || '', dados.nome_contato || '', idfornecedor]
      );

      // Atualiza endereco
      await connection.query(
        `UPDATE endereco SET
          cidade = ?, uf = ?, pais = ?, cep = ?, logradouro = ?, numero = ?, bairro = ?, complemento = ?
        WHERE idendereco = ?`,
        [
          dados.cidade,
          dados.uf,
          dados.pais || 'Brasil',
          dados.cep,
          dados.logradouro,
          dados.numero,
          dados.bairro,
          dados.complemento || null,
          idendereco
        ]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Deleta fornecedor e endereço associado em transação
   */
  static async deletarComEndereco(idfornecedor) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        'SELECT endereco_idendereco FROM fornecedor WHERE idfornecedor = ?',
        [idfornecedor]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return false;
      }

      const idendereco = rows[0].endereco_idendereco;

      // 1. Deletar fornecedor (se houver vínculos na tabela associativa produto_fornecedor, dispara erro 1451)
      await connection.query('DELETE FROM fornecedor WHERE idfornecedor = ?', [idfornecedor]);

      // 2. Deletar endereço associado
      await connection.query('DELETE FROM endereco WHERE idendereco = ?', [idendereco]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = FornecedorModel;
