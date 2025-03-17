const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para obtener información del usuario
router.get('/user', auth, authController.getUser);

// Crear usuario para empleado (solo RH)
router.post('/users', auth, checkRole('recursosHumanos'), authController.crearUsuario);


module.exports = router;