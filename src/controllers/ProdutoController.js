const ProdutoModel = require('../models/ProdutoModel');

class ProdutoController {
  static async listar(req, res, next) {
    try {
      const { busca, categoria_id } = req.query;
      const produtos = await ProdutoModel.listarTodos({ busca, categoria_id });
      return res.status(200).json(produtos);
    } catch (error) {
      next(error);
    }
  }

  static async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await ProdutoModel.buscarPorId(id);
      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      return res.status(200).json(produto);
    } catch (error) {
      next(error);
    }
  }

  static async criar(req, res, next) {
    try {
      const {
        categoria_idcategoria,
        nome,
        quantidade_estoque,
        unidade_medida,
        estoque_minimo,
        preco_custo,
        data_validade
      } = req.body;

      if (!nome || !categoria_idcategoria || !unidade_medida) {
        return res.status(400).json({
          erro: 'Nome, categoria e unidade de medida são campos obrigatórios'
        });
      }

      const novoProduto = await ProdutoModel.criar({
        categoria_idcategoria,
        nome,
        quantidade_estoque,
        unidade_medida,
        estoque_minimo,
        preco_custo,
        data_validade
      });

      return res.status(201).json({
        idproduto: novoProduto.idproduto,
        mensagem: 'Produto cadastrado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  static async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const {
        categoria_idcategoria,
        nome,
        quantidade_estoque,
        unidade_medida,
        estoque_minimo,
        preco_custo,
        data_validade
      } = req.body;

      if (!nome || !categoria_idcategoria || !unidade_medida) {
        return res.status(400).json({
          erro: 'Nome, categoria e unidade de medida são campos obrigatórios'
        });
      }

      const atualizado = await ProdutoModel.atualizar(id, {
        categoria_idcategoria,
        nome,
        quantidade_estoque,
        unidade_medida,
        estoque_minimo,
        preco_custo,
        data_validade
      });

      if (!atualizado) {
        return res.status(404).json({ erro: 'Produto não encontrado para atualização' });
      }

      return res.status(200).json({ mensagem: 'Produto atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await ProdutoModel.deletar(id);
      if (!deletado) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      return res.status(200).json({ mensagem: 'Produto excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProdutoController;
