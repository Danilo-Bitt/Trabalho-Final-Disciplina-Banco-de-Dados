const express = require('express');
const router = express.Router();
const ProdutoFornecedorController = require('../controllers/ProdutoFornecedorController');

router.get('/produto-fornecedor', ProdutoFornecedorController.listar);
router.get('/produto-fornecedor/:produto_id', ProdutoFornecedorController.listar);
router.post('/produto-fornecedor', ProdutoFornecedorController.vincular);
router.delete('/produto-fornecedor', ProdutoFornecedorController.desvincular);

module.exports = router;
