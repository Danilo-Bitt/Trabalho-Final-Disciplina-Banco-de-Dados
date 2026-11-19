const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/FornecedorController');

router.get('/fornecedores', FornecedorController.listar);
router.get('/fornecedores/:id', FornecedorController.buscarPorId);
router.post('/fornecedores', FornecedorController.criar);
router.put('/fornecedores/:id', FornecedorController.atualizar);
router.delete('/fornecedores/:id', FornecedorController.deletar);

module.exports = router;
