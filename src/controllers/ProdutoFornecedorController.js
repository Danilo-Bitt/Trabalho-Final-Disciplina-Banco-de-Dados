const ProdutoFornecedorModel = require('../models/ProdutoFornecedorModel');

class ProdutoFornecedorController {
  static async listar(req, res, next) {
    try {
      const idproduto = req.query.produto_idproduto || req.params.produto_id;
      if (!idproduto) {
        return res.status(400).json({ erro: 'ID do produto é obrigatório' });
      }

      const lista = await ProdutoFornecedorModel.listarPorProduto(idproduto);
      return res.status(200).json(lista);
    } catch (error) {
      next(error);
    }
  }

  static async vincular(req, res, next) {
    try {
      const {
        produto_idproduto,
        fornecedor_idfornecedor,
        preco_fornecedor,
        codigo_sku_fornecedor,
        prazo_entrega_dias
      } = req.body;

      if (!produto_idproduto || !fornecedor_idfornecedor) {
        return res.status(400).json({
          erro: 'Produto e fornecedor são obrigatórios para realizar o vínculo'
        });
      }

      await ProdutoFornecedorModel.vincular({
        produto_idproduto,
        fornecedor_idfornecedor,
        preco_fornecedor,
        codigo_sku_fornecedor,
        prazo_entrega_dias
      });

      return res.status(201).json({ mensagem: 'Fornecedor vinculado com sucesso ao produto' });
    } catch (error) {
      next(error);
    }
  }

  static async desvincular(req, res, next) {
    try {
      const produto_id = req.query.produto_idproduto || req.body.produto_idproduto;
      const fornecedor_id = req.query.fornecedor_idfornecedor || req.body.fornecedor_idfornecedor;

      if (!produto_id || !fornecedor_id) {
        return res.status(400).json({
          erro: 'produto_idproduto e fornecedor_idfornecedor são obrigatórios para desvincular'
        });
      }

      const removido = await ProdutoFornecedorModel.desvincular(produto_id, fornecedor_id);
      if (!removido) {
        return res.status(404).json({ erro: 'Vínculo não encontrado' });
      }

      return res.status(200).json({ mensagem: 'Vínculo removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProdutoFornecedorController;
