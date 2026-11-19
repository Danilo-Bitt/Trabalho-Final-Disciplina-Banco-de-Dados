const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioModel {
  static async listarTodos({ busca, cargo } = {}) {
    let sql = 'SELECT idusuario, nome_usuario, cargo, login FROM usuario WHERE 1=1';
    const params = [];

    if (busca) {
      sql += ' AND (nome_usuario LIKE ? OR login LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }

    if (cargo) {
      sql += ' AND cargo = ?';
      params.push(cargo);
    }

    sql += ' ORDER BY nome_usuario ASC';

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async buscarPorId(id) {
    const [rows] = await db.query(
      'SELECT idusuario, nome_usuario, cargo, login FROM usuario WHERE idusuario = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async buscarPorLogin(login) {
    const [rows] = await db.query('SELECT * FROM usuario WHERE login = ?', [login]);
    return rows[0] || null;
  }

  static async criar({ nome_usuario, cargo, login, senha }) {
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const [result] = await db.query(
      'INSERT INTO usuario (nome_usuario, cargo, login, senha) VALUES (?, ?, ?, ?)',
      [nome_usuario, cargo, login, senhaHash]
    );

    return {
      idusuario: result.insertId,
      nome_usuario,
      cargo,
      login
    };
  }

  static async atualizar(id, { nome_usuario, cargo, login, senha }) {
    if (senha && senha.trim() !== '') {
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      const [result] = await db.query(
        'UPDATE usuario SET nome_usuario = ?, cargo = ?, login = ?, senha = ? WHERE idusuario = ?',
        [nome_usuario, cargo, login, senhaHash, id]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await db.query(
        'UPDATE usuario SET nome_usuario = ?, cargo = ?, login = ? WHERE idusuario = ?',
        [nome_usuario, cargo, login, id]
      );
      return result.affectedRows > 0;
    }
  }

  static async deletar(id) {
    const [result] = await db.query('DELETE FROM usuario WHERE idusuario = ?', [id]);
    return result.affectedRows > 0;
  }

  static async verificarSenha(senhaPlana, senhaHash) {
    if (!senhaHash || !senhaPlana) return false;

    // Se a senha estiver armazenada em formato hash bcrypt ($2a$ ou $2b$)
    if (senhaHash.startsWith('$2a$') || senhaHash.startsWith('$2b$')) {
      return bcrypt.compare(senhaPlana, senhaHash);
    }

    // Fallback de compatibilidade para senhas legadas em texto puro (como as do banco_acaiteria.sql)
    return senhaPlana === senhaHash;
  }
}

module.exports = UsuarioModel;
