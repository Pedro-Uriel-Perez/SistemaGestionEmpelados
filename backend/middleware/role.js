exports.checkRole = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
      }
      
      // Si es usuario de RH, permitir acceso a todo
      if (req.user.rol === 'recursosHumanos') {
        return next();
      }
      
      // Para otros roles, verificar si tienen permiso
      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({ message: 'No autorizado para esta operación' });
      }
      
      next();
    };
  };