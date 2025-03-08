const empleadoService = require('../services/empleadoService');
const User = require('../models/User');
const Empleado = require('../models/Empleado');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService')

// Crear empleado
exports.crearEmpleado = async (req, res) => {
  try {
    const fotoPath = req.file ? req.file.path : null;
    
    const empleado = await empleadoService.crearEmpleado(req.body, fotoPath);
    
    res.status(201).json({
      success: true,
      data: empleado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear empleado',
      error: error.message
    });
  }
};

// Obtener todos los empleados
exports.obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await empleadoService.obtenerEmpleados(req.query);
    
    res.status(200).json({
      success: true,
      count: empleados.length,
      data: empleados
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleados',
      error: error.message
    });
  }
};

// Obtener empleado por ID
exports.obtenerEmpleadoPorId = async (req, res) => {
  try {
    const empleado = await empleadoService.obtenerEmpleadoPorId(req.params.id);
    
    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: empleado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleado',
      error: error.message
    });
  }
};

// Actualizar empleado
exports.actualizarEmpleado = async (req, res) => {
  try {
    const empleado = await empleadoService.obtenerEmpleadoPorId(req.params.id);
    
    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }
    
    const fotoPath = req.file ? req.file.path : null;
    
    const empleadoActualizado = await empleadoService.actualizarEmpleado(
      req.params.id, 
      req.body, 
      fotoPath
    );
    
    res.status(200).json({
      success: true,
      data: empleadoActualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar empleado',
      error: error.message
    });
  }
};

// Eliminar empleado
exports.eliminarEmpleado = async (req, res) => {
  try {
    const resultado = await empleadoService.eliminarEmpleado(req.params.id);
    
    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Empleado eliminado correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar empleado',
      error: error.message
    });
  }
};

// Cambiar estado de empleado
exports.cambiarEstado = async (req, res) => {
  try {
    const { tipo, fecha, motivo } = req.body;
    
    if (!tipo || !fecha || !motivo) {
      return res.status(400).json({
        success: false,
        message: 'Tipo, fecha y motivo son requeridos'
      });
    }
    
    const empleado = await empleadoService.cambiarEstado(req.params.id, req.body);
    
    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: empleado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del empleado',
      error: error.message
    });
  }
};

exports.obtenerPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener el usuario con su relación al empleado
    const usuario = await User.findById(userId);
    
    if (!usuario || !usuario.empleado) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el perfil asociado'
      });
    }
    
    // Obtener los datos del empleado
    const empleado = await Empleado.findById(usuario.empleado);
    
    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: 'Empleado no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: empleado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil',
      error: error.message
    });
  }
};

exports.crearUsuario = async (req, res) => {
  const { empleadoId, username, password, rol } = req.body;
  
  try {
    // Verificar si el rol es válido
    if (!['recursosHumanos', 'empleado'].includes(rol)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }
    
    // Verificar si existe el empleado
    const empleado = await Empleado.findById(empleadoId);
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    // Verificar si ya existe un usuario para este empleado
    const usuarioExistente = await User.findOne({ empleado: empleadoId });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Ya existe un usuario para este empleado' });
    }
    
    // Búsqueda específica: encontrar usuarios con ese username que NO estén asociados a este empleado
    // Esto es crucial: el empleado debe poder usar su propio email, pero otros no
    const usersWithSameUsername = await User.find({ username: username });
    
    // Si hay usuarios con el mismo username, verificar que no sea el mismo empleado
    if (usersWithSameUsername.length > 0) {
      // Verificar que ninguno de los usuarios encontrados corresponda a este empleado
      // (debería ser cero usuarios porque ya verificamos que no existe un usuario para este empleado)
      const conflictingUsers = usersWithSameUsername.filter(user => 
        !user.empleado || user.empleado.toString() !== empleadoId.toString()
      );
      
      if (conflictingUsers.length > 0) {
        return res.status(400).json({ message: 'Ese nombre de usuario ya está en uso' });
      }
    }
    
    // Crear hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear nuevo usuario
    const newUser = new User({
      username,
      password: hashedPassword,
      rol,
      empleado: empleadoId,
      requiereCambioPassword: true
    });
    
    await newUser.save();

    // Enviar credenciales por correo electrónico
    const nombreCompleto = `${empleado.nombre} ${empleado.apellidoPaterno} ${empleado.apellidoMaterno}`;
    const emailEnviado = await emailService.enviarCredencialesPorEmail(
      nombreCompleto, 
      empleado.email, 
      username, 
      password
    );

    // Responder con éxito
    res.status(201).json({ 
      message: 'Usuario creado con éxito',
      emailEnviado: emailEnviado,
      user: {
        username: newUser.username,
        rol: newUser.rol,
        empleado: newUser.empleado
      }
    });
  } catch (err) {
    console.error('Error completo:', err);
    res.status(500).json({
      message: 'Error del servidor',
      error: err.message
    });
  }
};