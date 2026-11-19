const CategoriaModel = require('../models/CategoriaModel');

class CategoriaController {
  static async listar(req, res, next) {
    try {
      const categorias = await CategoriaModel.listarTodos();
      return res.status(200).json(categorias);
    } catch (error) {
      next(error);
    }
  }

  static async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaModel.buscarPorId(id);
      if (!categoria) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      return res.status(200).json(categoria);
    } catch (error) {
      next(error);
    }
  }

  static async criar(req, res, next) {
    try {
      const { nome, descricao } = req.body;
      if (!nome) {
        return res.status(400).json({ erro: 'O nome da categoria é obrigatório' });
      }

      const nova = await CategoriaModel.criar({ nome, descricao });
      return res.status(201).json(nova);
    } catch (error) {
      next(error);
    }
  }

  static async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nome, descricao } = req.body;

      if (!nome) {
        return res.status(400).json({ erro: 'O nome da categoria é obrigatório' });
      }

      const atualizado = await CategoriaModel.atualizar(id, { nome, descricao });
      if (!atualizado) {
        return res.status(404).json({ erro: 'Categoria não encontrada para atualização' });
      }

      return res.status(200).json({ mensagem: 'Categoria atualizada com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await CategoriaModel.deletar(id);
      if (!deletado) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      return res.status(200).json({ mensagem: 'Categoria excluída com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoriaController;
