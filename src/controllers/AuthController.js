const UsuarioModel = require('../models/UsuarioModel');

class AuthController {
  static async login(req, res, next) {
    try {
      const { login, senha } = req.body;

      if (!login || !senha) {
        return res.status(400).json({ erro: 'Login e senha são obrigatórios' });
      }

      const usuario = await UsuarioModel.buscarPorLogin(login);
      if (!usuario) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      }

      const senhaValida = await UsuarioModel.verificarSenha(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      }

      return res.status(200).json({
        idusuario: usuario.idusuario,
        nome_usuario: usuario.nome_usuario,
        cargo: usuario.cargo,
        login: usuario.login
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
