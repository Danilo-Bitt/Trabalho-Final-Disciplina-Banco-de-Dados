const FornecedorModel = require('../models/FornecedorModel');

class FornecedorController {
  static async listar(req, res, next) {
    try {
      const { busca } = req.query;
      const fornecedores = await FornecedorModel.listarTodos({ busca });
      return res.status(200).json(fornecedores);
    } catch (error) {
      next(error);
    }
  }

  static async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const fornecedor = await FornecedorModel.buscarPorId(id);
      if (!fornecedor) {
        return res.status(404).json({ erro: 'Fornecedor não encontrado' });
      }
      return res.status(200).json(fornecedor);
    } catch (error) {
      next(error);
    }
  }

  static async criar(req, res, next) {
    try {
      const {
        nome,
        cnpj,
        telefone,
        email,
        nome_contato,
        cep,
        logradouro,
        numero,
        bairro,
        complemento,
        cidade,
        uf,
        pais
      } = req.body;

      if (!nome || !cnpj || !telefone || !cep || !logradouro || !numero || !bairro || !cidade || !uf) {
        return res.status(400).json({
          erro: 'Preencha todos os campos obrigatórios da empresa e do endereço'
        });
      }

      const resultado = await FornecedorModel.criarComEndereco({
        nome,
        cnpj,
        telefone,
        email,
        nome_contato,
        cep,
        logradouro,
        numero,
        bairro,
        complemento,
        cidade,
        uf,
        pais
      });

      return res.status(201).json({
        idfornecedor: resultado.idfornecedor,
        mensagem: 'Fornecedor e endereço cadastrados com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  static async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const {
        nome,
        cnpj,
        telefone,
        email,
        nome_contato,
        cep,
        logradouro,
        numero,
        bairro,
        complemento,
        cidade,
        uf,
        pais
      } = req.body;

      if (!nome || !cnpj || !telefone || !cep || !logradouro || !numero || !bairro || !cidade || !uf) {
        return res.status(400).json({
          erro: 'Preencha todos os campos obrigatórios da empresa e do endereço'
        });
      }

      const atualizado = await FornecedorModel.atualizarComEndereco(id, {
        nome,
        cnpj,
        telefone,
        email,
        nome_contato,
        cep,
        logradouro,
        numero,
        bairro,
        complemento,
        cidade,
        uf,
        pais
      });

      if (!atualizado) {
        return res.status(404).json({ erro: 'Fornecedor não encontrado para atualização' });
      }

      return res.status(200).json({ mensagem: 'Fornecedor e endereço atualizados com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async deletar(req, res, next) {
    try {
      const { id } = req.params;
      const deletado = await FornecedorModel.deletarComEndereco(id);
      if (!deletado) {
        return res.status(404).json({ erro: 'Fornecedor não encontrado' });
      }
      return res.status(200).json({ mensagem: 'Fornecedor e endereço excluídos com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FornecedorController;
