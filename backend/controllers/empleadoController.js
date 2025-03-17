const empleadoService = require('../services/empleadoService');
const User = require('../models/User');
const Empleado = require('../models/Empleado');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

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

exports.obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await empleadoService.obtenerEmpleados(req.query);
    res.status(200).json({ success: true, count: empleados.length, data: empleados });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener empleados' });
  }
};

exports.obtenerEmpleadoPorId = async (req, res) => {
  try {
    const empleado = await empleadoService.obtenerEmpleadoPorId(req.params.id);
    if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.status(200).json({ success: true, data: empleado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener empleado' });
  }
};

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

exports.eliminarEmpleado = async (req, res) => {
  try {
    const resultado = await empleadoService.eliminarEmpleado(req.params.id);
    if (!resultado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.status(200).json({ success: true, message: 'Empleado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
  }
};

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

exports.crearUsuario = async (req, res) => {
  const { empleadoId, username, password, rol } = req.body;
  
  try {
    if (!['recursosHumanos', 'empleado'].includes(rol)) 
      return res.status(400).json({ message: 'Rol no válido' });
    
    const empleado = await Empleado.findById(empleadoId);
    if (!empleado) 
      return res.status(404).json({ message: 'Empleado no encontrado' });
    
    // Verificar si ya existe un usuario para este empleado
    const usuarioExistente = await User.findOne({ empleado: empleadoId });
    if (usuarioExistente) 
      return res.status(400).json({ message: 'Ya existe un usuario para este empleado' });
    
    // Verificar si el nombre de usuario ya está en uso
    const usernameExistente = await User.findOne({ username });
    if (usernameExistente)
      return res.status(400).json({ message: 'Ese nombre de usuario ya está en uso' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      username,
      password: hashedPassword,
      rol,
      empleado: empleadoId,
      requiereCambioPassword: true
    });
    
    await newUser.save();

    try {
      const nombreCompleto = `${empleado.nombre} ${empleado.apellidoPaterno} ${empleado.apellidoMaterno}`;
      const emailEnviado = await emailService.enviarCredencialesPorEmail(nombreCompleto, empleado.email, username, password);
      
      res.status(201).json({
        message: 'Usuario creado con éxito',
        emailEnviado,
        user: { username: newUser.username, rol: newUser.rol, empleado: newUser.empleado }
      });
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      res.status(201).json({
        message: 'Usuario creado con éxito, pero no se pudieron enviar las credenciales por email',
        emailEnviado: false,
        error: emailError.message,
        user: { username: newUser.username, rol: newUser.rol, empleado: newUser.empleado }
      });
    }
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
};

exports.actualizarMiPerfil = async (req, res) => {
  try {
    // Obtener el ID del empleado desde el token de autenticación
    const usuario = await User.findById(req.user.id);
    if (!usuario || !usuario.empleado) {
      return res.status(404).json({ success: false, message: 'No se encontró el perfil asociado' });
    }
    
    const empleadoId = usuario.empleado;
    
    // Procesar los datos recibidos
    const datosProcesados = {
      direccion: req.body.direccion,
      ciudad: req.body.ciudad,
      email: req.body.email
    };
    
    // Procesar teléfonos y referencias familiares
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
    
    // Si hay una foto, procesarla
    const fotoPath = req.file ? req.file.path : null;
    
    // Actualizar el empleado
    const empleadoActualizado = await empleadoService.actualizarEmpleado(empleadoId, datosProcesados, fotoPath);
    
    res.status(200).json({ success: true, data: empleadoActualizado });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: error.message });
  }
};