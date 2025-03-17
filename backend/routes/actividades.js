const express = require('express');
const router = express.Router();
const actividadController = require('../controllers/actividadController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Solo catálogo y creación de actividades (solo RH)
router.get('/', auth, checkRole('recursosHumanos'), actividadController.listarActividades);
router.post('/', auth, checkRole('recursosHumanos'), actividadController.crearActividad);

// Asignar y gestionar participación (solo RH)
router.post('/asignar/:empleadoId', auth, checkRole('recursosHumanos'), actividadController.asignarActividad);
router.put('/participacion/:empleadoId/:actividadId', auth, checkRole('recursosHumanos'), actividadController.actualizarParticipacion);
router.get('/empleado/:empleadoId', auth, checkRole('recursosHumanos'), actividadController.obtenerActividadesEmpleado);

module.exports = router;