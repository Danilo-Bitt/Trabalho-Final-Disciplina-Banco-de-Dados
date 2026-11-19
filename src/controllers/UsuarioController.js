const UsuarioModel = require('../models/UsuarioModel');

class UsuarioController {
  static async listar(req, res, next) {
    try {
      const { busca, cargo } = req.query;
      const usuarios = await UsuarioModel.listarTodos({ busca, cargo });
      return res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  }

  static async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioModel.buscarPorId(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      return res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  static async criar(req, res, next) {
    try {
      const { nome_usuario, cargo, login, senha } = req.body;

      if (!nome_usuario || !cargo || !login || !senha) {
        return res.status(400).json({
          erro: 'Nome, cargo, login e senha são campos obrigatórios'
        });
      }

      const novo = await UsuarioModel.criar({ nome_usuario, cargo, login, senha });
      return res.status(201).json({
        idusuario: novo.idusuario,
        nome_usuario: novo.nome_usuario,
        cargo: novo.cargo,
        login: novo.login,
        mensagem: 'Usuário cadastrado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  static async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nome_usuario, cargo, login, senha } = req.body;

      if (!nome_usuario || !cargo || !login) {
        return res.status(400).json({
          erro: 'Nome, cargo e login são campos obrigatórios'
        });
      }

      const atualizado = await UsuarioModel.atualizar(id, {
        nome_usuario,
        cargo,
        login,
        senha
      });

      if (!atualizado) {
        return res.status(404).json({ erro: 'Usuário não encontrado para atualização' });
      }

      return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await UsuarioModel.deletar(id);
      if (!deletado) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      return res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsuarioController;
