const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const upload = require('../middleware/upload');

// Ruta para obtener el perfil del empleado actual
router.get('/perfil', auth, empleadoController.obtenerPerfil);

// Ruta para crear un empleado (solo RH)
router.post('/',auth, checkRole('recursosHumanos'), upload.single('foto'), empleadoController.crearEmpleado);

// Ruta para obtener todos los empleados (solo RH)
router.get('/',auth,checkRole('recursosHumanos'), empleadoController.obtenerEmpleados);

// Ruta para obtener un empleado por ID
router.get('/:id',auth,empleadoController.obtenerEmpleadoPorId);

// Ruta para actualizar un empleado (solo RG)
router.put('/:id',auth, checkRole('recursosHumanos', 'empleado'), upload.single('foto'),empleadoController.actualizarEmpleado);

// Ruta para eliminar un empleado (solo RH)
router.delete('/:id',auth,checkRole('recursosHumanos'), empleadoController.eliminarEmpleado);

// Ruta para cambiar el estado de un empleado (solo RH)
router.patch('/:id/estado',auth,checkRole('recursosHumanos'), empleadoController.cambiarEstado);

router.put('/perfil', auth, upload.single('foto'), empleadoController.actualizarMiPerfil);



module.exports = router;