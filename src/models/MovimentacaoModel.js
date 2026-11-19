const db = require('../config/database');

class MovimentacaoModel {
  static async listarRecentes(limite = 10) {
    const sql = `
      SELECT 
        m.idmovimentacao,
        m.produto_idproduto,
        p.nome AS produto_nome,
        p.unidade_medida,
        m.usuario_idusuario,
        u.nome_usuario AS usuario_nome,
        m.tipo,
        m.quantidade,
        DATE_FORMAT(m.data_hora, '%d/%m/%Y %H:%i:%s') AS data_hora_formatada,
        m.data_hora,
        m.descricao
      FROM movimentacao m
      INNER JOIN produto p ON m.produto_idproduto = p.idproduto
      INNER JOIN usuario u ON m.usuario_idusuario = u.idusuario
      ORDER BY m.data_hora DESC, m.idmovimentacao DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [Number(limite)]);
    return rows;
  }

  /**
   * Conforme especificado na Página 10 do PDF:
   * Realiza as duas operações juntas em transação:
   * 1. Insere o registro em movimentacao
   * 2. Atualiza quantidade_estoque do produto (+ para ENTRADA, - para SAIDA)
   */
  static async registrarMovimentacao({
    produto_idproduto,
    usuario_idusuario,
    tipo,
    quantidade,
    descricao
  }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const qtd = parseFloat(quantidade);
      if (isNaN(qtd) || qtd <= 0) {
        throw new Error('A quantidade deve ser um número maior que zero');
      }

      const tipoUpper = tipo.toUpperCase();
      if (tipoUpper !== 'ENTRADA' && tipoUpper !== 'SAIDA') {
        throw new Error('Tipo de movimentação inválido. Deve ser ENTRADA ou SAIDA');
      }

      // 1. Obter produto atual com lock para update
      const [produtos] = await connection.query(
        'SELECT idproduto, nome, quantidade_estoque FROM produto WHERE idproduto = ? FOR UPDATE',
        [produto_idproduto]
      );

      if (produtos.length === 0) {
        throw new Error('Produto selecionado não foi encontrado');
      }

      const produtoAtual = produtos[0];
      const estoqueAtual = parseFloat(produtoAtual.quantidade_estoque);

      if (tipoUpper === 'SAIDA' && estoqueAtual < qtd) {
        throw new Error(
          `Saldo insuficiente em estoque. Saldo atual: ${estoqueAtual}, saída solicitada: ${qtd}`
        );
      }

      // 2. Inserir registro na tabela movimentacao
      const sqlMovimentacao = `
        INSERT INTO movimentacao (
          produto_idproduto,
          usuario_idusuario,
          tipo,
          quantidade,
          data_hora,
          descricao
        ) VALUES (?, ?, ?, ?, NOW(), ?)
      `;
      const [resMov] = await connection.query(sqlMovimentacao, [
        produto_idproduto,
        usuario_idusuario,
        tipoUpper,
        qtd,
        descricao
      ]);

      // 3. Executar UPDATE no produto
      const sqlUpdateProduto = tipoUpper === 'ENTRADA'
        ? 'UPDATE produto SET quantidade_estoque = quantidade_estoque + ? WHERE idproduto = ?'
        : 'UPDATE produto SET quantidade_estoque = quantidade_estoque - ? WHERE idproduto = ?';

      await connection.query(sqlUpdateProduto, [qtd, produto_idproduto]);

      await connection.commit();

      return {
        idmovimentacao: resMov.insertId,
        produto_idproduto,
        tipo: tipoUpper,
        quantidade: qtd
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = MovimentacaoModel;
