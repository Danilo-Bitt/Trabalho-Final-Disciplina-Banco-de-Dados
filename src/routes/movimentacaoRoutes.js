const express = require('express');
const router = express.Router();
const MovimentacaoController = require('../controllers/MovimentacaoController');

router.post('/movimentacoes', MovimentacaoController.criar);
router.get('/movimentacoes', MovimentacaoController.listarRecentes);

module.exports = router;
