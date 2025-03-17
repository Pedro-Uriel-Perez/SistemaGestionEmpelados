const express = require('express');
const router = express.Router();
const departamentoController = require('../controllers/departamentoController');
const auth = require('../middleware/auth');

// Ruta para inicializar datos
router.get('/inicializar', departamentoController.inicializarDatos);

// Ruta para obtener todos los departamentos
router.get('/', departamentoController.obtenerDepartamentos);

// Ruta para obtener todos los puestos
router.get('/puestos/todos', departamentoController.obtenerTodosLosPuestos);

// Ruta para obtener un departamento por ID
router.get('/:id', departamentoController.obtenerDepartamento);

// Ruta para obtener puestos de un departamento
router.get('/:id/puestos', departamentoController.obtenerPuestosPorDepartamento);

module.exports = router;