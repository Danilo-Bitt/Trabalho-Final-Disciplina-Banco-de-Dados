const MovimentacaoModel = require('../models/MovimentacaoModel');

class MovimentacaoController {
  static async criar(req, res, next) {
    try {
      const {
        produto_idproduto,
        usuario_idusuario,
        tipo,
        quantidade,
        descricao
      } = req.body;

      if (!produto_idproduto || !usuario_idusuario || !tipo || !quantidade || !descricao) {
        return res.status(400).json({
          erro: 'Todos os campos são obrigatórios para registrar a movimentação'
        });
      }

      const resultado = await MovimentacaoModel.registrarMovimentacao({
        produto_idproduto,
        usuario_idusuario,
        tipo,
        quantidade,
        descricao
      });

      return res.status(201).json({
        idmovimentacao: resultado.idmovimentacao,
        mensagem: 'Movimentação registrada com sucesso e estoque atualizado!'
      });
    } catch (error) {
      // Repassa erro para o errorHandler ou trata mensagens específicas de negócio
      if (error.message.includes('Saldo insuficiente') || error.message.includes('inválido')) {
        return res.status(400).json({ erro: error.message });
      }
      next(error);
    }
  }

  static async listarRecentes(req, res, next) {
    try {
      const limite = req.query.limite || 15;
      const movimentacoes = await MovimentacaoModel.listarRecentes(limite);
      return res.status(200).json(movimentacoes);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MovimentacaoController;
