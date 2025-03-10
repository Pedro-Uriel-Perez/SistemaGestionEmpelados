const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Obtener token del header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Verificar si hay token
  if (!token) {
    return res.status(401).json({ message: 'No hay token, acceso denegado' });
  }
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar usuario al request
    req.user = decoded.user || decoded; // Intentar ambas estructuras para compatibilidad
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token no válido' });
  }
};