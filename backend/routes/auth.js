const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para obtener información del usuario
router.get('/user', auth, authController.getUser);

// Crear usuario administrador (solo si no existe)
router.post('/admin', authController.createAdminUser);

// Crear usuario para empleado (solo admin y RRHH)
router.post('/users', auth, checkRole('admin', 'recursosHumanos'), authController.crearUsuario);

module.exports = router;