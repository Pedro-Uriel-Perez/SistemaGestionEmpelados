const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const auth = require('../middleware/auth');

// Rutas para cursos
router.post('/:empleadoId/cursos', auth, cursoController.registrarCurso);
router.get('/:empleadoId/cursos', auth, cursoController.obtenerCursos);
router.get('/:empleadoId/cursos/:cursoId', auth, cursoController.obtenerCurso);
router.put('/:empleadoId/cursos/:cursoId', auth, cursoController.actualizarCurso);
router.delete('/:empleadoId/cursos/:cursoId', auth, cursoController.eliminarCurso);

module.exports = router;