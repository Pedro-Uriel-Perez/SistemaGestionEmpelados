const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');

// Rutas para obtener catálogos 
router.get('/departamentos', catalogoController.obtenerDepartamentos);
router.get('/puestos', catalogoController.obtenerPuestos);
router.get('/ciudades', catalogoController.obtenerCiudades);

module.exports = router;