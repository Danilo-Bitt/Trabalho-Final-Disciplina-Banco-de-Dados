const db = require('../config/database');

class ProdutoFornecedorModel {
  static async listarPorProduto(idproduto) {
    const sql = `
      SELECT 
        pf.produto_idproduto,
        pf.fornecedor_idfornecedor,
        pf.preco_fornecedor,
        pf.codigo_sku_fornecedor,
        pf.prazo_entrega_dias,
        f.nome AS fornecedor_nome,
        f.cnpj AS fornecedor_cnpj,
        f.telefone AS fornecedor_telefone
      FROM produto_fornecedor pf
      INNER JOIN fornecedor f ON pf.fornecedor_idfornecedor = f.idfornecedor
      WHERE pf.produto_idproduto = ?
      ORDER BY f.nome ASC
    `;
    const [rows] = await db.query(sql, [idproduto]);
    return rows;
  }

  static async vincular({
    produto_idproduto,
    fornecedor_idfornecedor,
    preco_fornecedor,
    codigo_sku_fornecedor,
    prazo_entrega_dias
  }) {
    const sql = `
      INSERT INTO produto_fornecedor (
        produto_idproduto,
        fornecedor_idfornecedor,
        preco_fornecedor,
        codigo_sku_fornecedor,
        prazo_entrega_dias
      ) VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        preco_fornecedor = VALUES(preco_fornecedor),
        codigo_sku_fornecedor = VALUES(codigo_sku_fornecedor),
        prazo_entrega_dias = VALUES(prazo_entrega_dias)
    `;
    const [result] = await db.query(sql, [
      produto_idproduto,
      fornecedor_idfornecedor,
      preco_fornecedor || 0,
      codigo_sku_fornecedor || '',
      prazo_entrega_dias || 0
    ]);
    return result;
  }

  static async desvincular(produto_idproduto, fornecedor_idfornecedor) {
    const sql = `
      DELETE FROM produto_fornecedor 
      WHERE produto_idproduto = ? AND fornecedor_idfornecedor = ?
    `;
    const [result] = await db.query(sql, [produto_idproduto, fornecedor_idfornecedor]);
    return result.affectedRows > 0;
  }
}

module.exports = ProdutoFornecedorModel;
