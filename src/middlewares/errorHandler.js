/**
 * Middleware central de tratamento de erros
 * Conforme RNF07 (Integridade Referencial) e especificações do PDF
 */
function errorHandler(err, req, res, next) {
  console.error('[ERRO NO SERVIDOR]:', err);

  // Erro de integridade de Chave Estrangeira do MySQL (ER_ROW_IS_REFERENCED_2 / código 1451)
  if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      erro: 'Não é possível excluir este registro pois existem itens vinculados a ele'
    });
  }

  // Erro de Chave Estrangeira não encontrada (registro pai não existe / código 1452)
  if (err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      erro: 'Registro relacionado não encontrado ou inválido'
    });
  }

  // Registro duplicado (login ou CNPJ já cadastrados / código 1062)
  if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      erro: 'Já existe um registro com estes dados únicos (login ou CNPJ já cadastrado)'
    });
  }

  // Outros erros
  const status = err.statusCode || 500;
  const mensagem = err.message || 'Erro interno no servidor';

  return res.status(status).json({ erro: mensagem });
}

module.exports = errorHandler;
