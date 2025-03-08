const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const upload = require('../middleware/upload');

// IMPORTANTE: Esta ruta debe estar ANTES de la ruta con parámetro /:id
// Ruta para obtener el perfil del empleado actual
router.get('/perfil', auth, empleadoController.obtenerPerfil);

// Ruta para crear un empleado (solo admin y RRHH)
router.post('/',
  auth, 
  checkRole('admin', 'recursosHumanos'), 
  upload.single('foto'), 
  empleadoController.crearEmpleado
);

// Ruta para obtener todos los empleados (solo admin y RRHH)
router.get('/', 
  auth, 
  checkRole('admin', 'recursosHumanos'), 
  empleadoController.obtenerEmpleados
);

// Ruta para obtener un empleado por ID
router.get('/:id', 
  auth, 
  empleadoController.obtenerEmpleadoPorId
);

// Ruta para actualizar un empleado (solo admin y RRHH)
router.put('/:id', 
  auth, 
  checkRole('admin', 'recursosHumanos'), 
  upload.single('foto'), 
  empleadoController.actualizarEmpleado
);

// Ruta para eliminar un empleado (solo admin)
router.delete('/:id', 
  auth, 
  checkRole('admin'), 
  empleadoController.eliminarEmpleado
);

// Ruta para cambiar el estado de un empleado (solo admin y RRHH)
router.patch('/:id/estado', 
  auth, 
  checkRole('admin', 'recursosHumanos'), 
  empleadoController.cambiarEstado
);

module.exports = router;