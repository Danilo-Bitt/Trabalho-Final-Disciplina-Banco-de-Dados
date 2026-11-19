const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const produtoRoutes = require('./produtoRoutes');
const fornecedorRoutes = require('./fornecedorRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const movimentacaoRoutes = require('./movimentacaoRoutes');
const produtoFornecedorRoutes = require('./produtoFornecedorRoutes');

router.use(authRoutes);
router.use(dashboardRoutes);
router.use(categoriaRoutes);
router.use(produtoRoutes);
router.use(fornecedorRoutes);
router.use(usuarioRoutes);
router.use(movimentacaoRoutes);
router.use(produtoFornecedorRoutes);

module.exports = router;
