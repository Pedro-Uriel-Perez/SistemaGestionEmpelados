const empleadoService = require('../services/empleadoService');
const User = require('../models/User');
const Empleado = require('../models/Empleado');

// Crear un nuevo empleado
exports.crearEmpleado = async (req, res) => {
  try {
    const fotoPath = req.file ? req.file.path : null;
    const empleadoData = {...req.body};
    
    // Parsear campos JSON
    ['telefonos', 'referenciasFamiliares'].forEach(campo => {
      if (typeof empleadoData[campo] === 'string') {
        try { empleadoData[campo] = JSON.parse(empleadoData[campo]); } 
        catch (e) { empleadoData[campo] = campo === 'telefonos' ? [{ numero: empleadoData[campo], tipo: 'Personal' }] : []; }
      }
    });
    
    // Validar sexo
    if (!empleadoData.sexo || !['Masculino', 'Femenino'].includes(empleadoData.sexo)) {
      return res.status(400).json({ success: false, message: 'El campo sexo es requerido y debe ser "Masculino" o "Femenino"' });
    }
    
    const empleado = await empleadoService.crearEmpleado(empleadoData, fotoPath);
    res.status(201).json({ success: true, data: empleado });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ success: false, message: 'Error al crear empleado', error: error.message });
  }
};

// Obtener todos los empleados con filtros
exports.obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await empleadoService.obtenerEmpleados(req.query);
    res.status(200).json({ success: true, count: empleados.length, data: empleados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener empleados' });
  }
};

// Obtener un empleado por su ID
exports.obtenerEmpleadoPorId = async (req, res) => {
  try {
    const empleado = await empleadoService.obtenerEmpleadoPorId(req.params.id);
    if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.status(200).json({ success: true, data: empleado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener empleado' });
  }
};

// Actualizar datos de un empleado
exports.actualizarEmpleado = async (req, res) => {
  try {
    const empleado = await empleadoService.obtenerEmpleadoPorId(req.params.id);
    if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    
    const datosProcesados = { ...req.body };
    ['telefonos', 'referenciasFamiliares', 'cursos', 'actividades', 'bajas'].forEach(campo => {
      if (datosProcesados[campo] && typeof datosProcesados[campo] === 'string') {
        try { datosProcesados[campo] = JSON.parse(datosProcesados[campo]); } catch (e) {}
      }
    });
    
    const fotoPath = req.file ? req.file.path : null;
    const empleadoActualizado = await empleadoService.actualizarEmpleado(req.params.id, datosProcesados, fotoPath);
    res.status(200).json({ success: true, data: empleadoActualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
  }
};

// Eliminar un empleado
exports.eliminarEmpleado = async (req, res) => {
  try {
    const resultado = await empleadoService.eliminarEmpleado(req.params.id);
    if (!resultado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.status(200).json({ success: true, message: 'Empleado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
  }
};

// Cambiar el estado de un empleado (activo, baja temporal, baja definitiva)
exports.cambiarEstado = async (req, res) => {
  try {
    const { tipo, fecha, motivo } = req.body;
    if (!tipo || !fecha || !motivo) return res.status(400).json({ success: false, message: 'Tipo, fecha y motivo son requeridos' });
    
    const empleado = await empleadoService.cambiarEstado(req.params.id, req.body);
    if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    
    res.status(200).json({ success: true, data: empleado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado del empleado' });
  }
};

// Obtener el perfil del empleado autenticado
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario || !usuario.empleado) return res.status(404).json({ success: false, message: 'No se encontró el perfil asociado' });
    
    const empleado = await Empleado.findById(usuario.empleado);
    if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    
    res.status(200).json({ success: true, data: empleado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el perfil' });
  }
};

// Actualizar el perfil propio del empleado
exports.actualizarMiPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario || !usuario.empleado) {
      return res.status(404).json({ success: false, message: 'No se encontró el perfil asociado' });
    }
    
    const empleadoId = usuario.empleado;
    
    const datosProcesados = {
      direccion: req.body.direccion,
      ciudad: req.body.ciudad,
      email: req.body.email
    };
    
    ['telefonos', 'referenciasFamiliares'].forEach(campo => {
      if (req.body[campo]) {
        try { 
          datosProcesados[campo] = typeof req.body[campo] === 'string' 
            ? JSON.parse(req.body[campo]) 
            : req.body[campo]; 
        } catch (e) {
          console.error(`Error al procesar ${campo}:`, e);
        }
      }
    });
    
    const fotoPath = req.file ? req.file.path : null;
    const empleadoActualizado = await empleadoService.actualizarEmpleado(empleadoId, datosProcesados, fotoPath);
    
    res.status(200).json({ success: true, data: empleadoActualizado });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: error.message });
  }
};