const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Empleado = require('../models/Empleado'); // Añade esta línea
const emailService = require('../services/emailService'); // Añade esta línea
require('dotenv').config();

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Verificar si el usuario existe
    let user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    // Crear y retornar JWT
    const payload = {
      user: {
        id: user.id,
        rol: user.rol
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            _id: user._id,
            username: user.username,
            rol: user.rol,
            empleado: user.empleado
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Obtener usuario autenticado
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Crear admin (solo debe usarse una vez)
exports.createAdminUser = async (req, res) => {
  try {
    // Verificar si ya existe un admin
    const adminExists = await User.findOne({ rol: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({ message: 'Ya existe un usuario administrador' });
    }
    
    // Crear hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Crear usuario admin
    const adminUser = new User({
      username: 'admin@sistema.com',
      password: hashedPassword,
      rol: 'admin'
    });
    
    await adminUser.save();
    
    res.json({ message: 'Usuario administrador creado con éxito' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// Crear usuario para empleado
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
    
    // Verificar si el nombre de usuario ya está en uso
    const userExists = await User.findOne({ 
      username,
      empleado: { $ne: empleadoId }
    });
    
    if (userExists) {
      return res.status(400).json({ message: 'Ese nombre de usuario ya está en uso' });
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
      requiereCambioPassword: true // Marcar que requiere cambio de contraseña
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

    // Responder con éxito, indicando si se envió el correo
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
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};