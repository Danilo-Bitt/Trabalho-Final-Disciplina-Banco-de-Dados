const db = require('../config/database');

class CategoriaModel {
  static async listarTodos() {
    const [rows] = await db.query('SELECT * FROM categoria ORDER BY nome ASC');
    return rows;
  }

  static async buscarPorId(id) {
    const [rows] = await db.query('SELECT * FROM categoria WHERE idcategoria = ?', [id]);
    return rows[0] || null;
  }

  static async criar({ nome, descricao }) {
    const [result] = await db.query(
      'INSERT INTO categoria (nome, descricao) VALUES (?, ?)',
      [nome, descricao || null]
    );
    return { idcategoria: result.insertId, nome, descricao };
  }

  static async atualizar(id, { nome, descricao }) {
    const [result] = await db.query(
      'UPDATE categoria SET nome = ?, descricao = ? WHERE idcategoria = ?',
      [nome, descricao || null, id]
    );
    return result.affectedRows > 0;
  }

  static async deletar(id) {
    const [result] = await db.query('DELETE FROM categoria WHERE idcategoria = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CategoriaModel;
