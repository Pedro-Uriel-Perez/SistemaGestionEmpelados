// routes/actividades.js
const express = require('express');
const router = express.Router();
const actividadController = require('../controllers/actividadController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Solo RH puede registrar, actualizar o eliminar actividades
router.post('/:empleadoId/actividades', auth, checkRole('recursosHumanos'), actividadController.registrarActividad);
router.put('/:empleadoId/actividades/:actividadId', auth, checkRole('recursosHumanos'), actividadController.actualizarActividad);
router.delete('/:empleadoId/actividades/:actividadId', auth, checkRole('recursosHumanos'), actividadController.eliminarActividad);

// Todos pueden ver actividades (con restricciones por rol en el controlador)
router.get('/:empleadoId/actividades', auth, actividadController.obtenerActividades);
router.get('/:empleadoId/actividades/:actividadId', auth, actividadController.obtenerActividad);

module.exports = router;