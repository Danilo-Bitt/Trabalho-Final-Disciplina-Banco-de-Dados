const db = require('../config/database');

class ProdutoModel {
  static async listarTodos({ busca, categoria_id } = {}) {
    let sql = `
      SELECT 
        p.idproduto,
        p.categoria_idcategoria,
        c.nome AS categoria_nome,
        p.nome,
        p.quantidade_estoque,
        p.unidade_medida,
        p.estoque_minimo,
        p.preco_custo,
        DATE_FORMAT(p.data_validade, '%Y-%m-%d') AS data_validade
      FROM produto p
      INNER JOIN categoria c ON p.categoria_idcategoria = c.idcategoria
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      sql += ' AND p.nome LIKE ?';
      params.push(`%${busca}%`);
    }

    if (categoria_id) {
      sql += ' AND p.categoria_idcategoria = ?';
      params.push(categoria_id);
    }

    sql += ' ORDER BY p.nome ASC';

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async buscarPorId(id) {
    const sql = `
      SELECT 
        p.idproduto,
        p.categoria_idcategoria,
        c.nome AS categoria_nome,
        p.nome,
        p.quantidade_estoque,
        p.unidade_medida,
        p.estoque_minimo,
        p.preco_custo,
        DATE_FORMAT(p.data_validade, '%Y-%m-%d') AS data_validade
      FROM produto p
      INNER JOIN categoria c ON p.categoria_idcategoria = c.idcategoria
      WHERE p.idproduto = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async criar({
    categoria_idcategoria,
    nome,
    quantidade_estoque,
    unidade_medida,
    estoque_minimo,
    preco_custo,
    data_validade
  }) {
    const sql = `
      INSERT INTO produto (
        categoria_idcategoria,
        nome,
        quantidade_estoque,
        unidade_medida,
        estoque_minimo,
        preco_custo,
        data_validade
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      categoria_idcategoria,
      nome,
      quantidade_estoque || 0,
      unidade_medida,
      estoque_minimo || 0,
      preco_custo || 0,
      data_validade || null
    ]);

    return { idproduto: result.insertId };
  }

  static async atualizar(id, {
    categoria_idcategoria,
    nome,
    quantidade_estoque,
    unidade_medida,
    estoque_minimo,
    preco_custo,
    data_validade
  }) {
    const sql = `
      UPDATE produto SET
        categoria_idcategoria = ?,
        nome = ?,
        quantidade_estoque = ?,
        unidade_medida = ?,
        estoque_minimo = ?,
        preco_custo = ?,
        data_validade = ?
      WHERE idproduto = ?
    `;
    const [result] = await db.query(sql, [
      categoria_idcategoria,
      nome,
      quantidade_estoque,
      unidade_medida,
      estoque_minimo,
      preco_custo,
      data_validade || null,
      id
    ]);

    return result.affectedRows > 0;
  }

  static async deletar(id) {
    const [result] = await db.query('DELETE FROM produto WHERE idproduto = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ProdutoModel;
