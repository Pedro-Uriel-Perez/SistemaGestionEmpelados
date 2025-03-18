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
    const payload = {user: { id: user.id,rol: user.rol}
    };
    jwt.sign(payload, process.env.JWT_SECRET,{ expiresIn: '24h' },(err, token) => {
        if (err) throw err;
        res.json({token,
          user: {_id: user._id, username: user.username, rol: user.rol, empleado: user.empleado}
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

// Crear usuario para inicio de sesiosn de empleados
exports.crearUsuario = async (req, res) => {
  const { empleadoId, username, password, rol } = req.body;
  try {
    // Verificar si el rol es valid
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
    // Verificar si el username (email) ya está en uso
    const usernameExistente = await User.findOne({ username: username });
    if (usernameExistente) {
      return res.status(400).json({ message: 'Ese nombre de usuario ya está en uso' });
    }
    // se crae hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Crear nuevo usuario
    const newUser = new User({username, password: hashedPassword, rol, empleado: empleadoId});
    await newUser.save();
    // Se envian credenciales por correo
    const nombreCompleto = `${empleado.nombre} ${empleado.apellidoPaterno} ${empleado.apellidoMaterno}`;
    const emailEnviado = await emailService.enviarCredencialesPorEmail(
      nombreCompleto,empleado.email,username,password);
    // Exito
    res.status(201).json({ 
      message: 'Usuario creado con éxito',
      emailEnviado: emailEnviado,
      user: {username: newUser.username, rol: newUser.rol, empleado: newUser.empleado}
    });
  } catch (err) {
    console.error('Error completo:', err);
    res.status(500).json({
      message: 'Error del servidor',
      error: err.message
    });
  }
};