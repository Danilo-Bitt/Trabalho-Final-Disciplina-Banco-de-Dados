const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/CategoriaController');

router.get('/categorias', CategoriaController.listar);
router.get('/categorias/:id', CategoriaController.buscarPorId);
router.post('/categorias', CategoriaController.criar);
router.put('/categorias/:id', CategoriaController.atualizar);
router.delete('/categorias/:id', CategoriaController.deletar);

module.exports = router;
