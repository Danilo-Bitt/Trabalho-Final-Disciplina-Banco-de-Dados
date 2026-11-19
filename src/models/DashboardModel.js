const db = require('../config/database');
const MovimentacaoModel = require('./MovimentacaoModel');

class DashboardModel {
  static async obterDadosDashboard() {
    // 1. Total de produtos cadastrados
    const [totRows] = await db.query('SELECT COUNT(*) AS total FROM produto');
    const total_produtos = totRows[0].total || 0;

    // 2. Produtos com estoque baixo (quantidade_estoque <= estoque_minimo)
    const [baixoRows] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM produto 
      WHERE quantidade_estoque <= estoque_minimo
    `);
    const estoque_baixo = baixoRows[0].total || 0;

    // 3. Insumos próximos ao vencimento (válidos nos próximos 30 dias ou já vencidos)
    const [vencRows] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM produto 
      WHERE data_validade IS NOT NULL 
        AND data_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `);
    const vencimento = vencRows[0].total || 0;

    // 4. Últimas movimentações
    const ultimas_movimentacoes = await MovimentacaoModel.listarRecentes(15);

    return {
      kpis: {
        total_produtos,
        estoque_baixo,
        vencimento
      },
      movimentacoes: ultimas_movimentacoes
    };
  }
}

module.exports = DashboardModel;
