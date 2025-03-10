const cursoService = require('../services/cursoService');

// Registrar un nuevo curso
exports.registrarCurso = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { nombre, fechaInicio, fechaFin, tipoDocumento, observaciones } = req.body;
    
    // Validaciones
    if (!nombre || !fechaInicio || !fechaFin || !tipoDocumento) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, fechas y tipo de documento son requeridos'
      });
    }
    
    // Verificar permisos// Si es empleado regular, solo puede registrar cursos para sí mismo
    if (req.user?.rol === 'empleado' && req.user?.empleado && req.user.empleado.toString() !== empleadoId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para registrar cursos a este empleado'
      });
    }
    
    const cursoData = {
      nombre,
      fechaInicio,
      fechaFin,
      tipoDocumento,
      observaciones: observaciones || ''
    };
    
    const empleadoActualizado = await cursoService.agregarCurso(empleadoId, cursoData);
    
    res.status(201).json({
      success: true,
      data: empleadoActualizado.cursos[empleadoActualizado.cursos.length - 1],
      message: 'Curso registrado correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(error.message === 'Empleado no encontrado' ? 404 : 500).json({
      success: false,
      message: error.message || 'Error al registrar curso'
    });
  }
};

// Obtener todos los cursos de un empleado
exports.obtenerCursos = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    
    // Verificar permisos
    if (req.user?.rol === 'empleado') {
      // Si es rol empleado, permitir acceso sin verificación adicional
      // Esto permite que todos los empleados vean todos los cursos por ahora
    }
    
    const cursos = await cursoService.obtenerCursos(empleadoId);
    
    res.status(200).json({
      success: true,
      count: cursos.length,
      data: cursos
    });
  } catch (error) {
    console.error(error);
    res.status(error.message === 'Empleado no encontrado' ? 404 : 500).json({
      success: false,
      message: error.message || 'Error al obtener cursos'
    });
  }
};

// Obtener un curso específico
exports.obtenerCurso = async (req, res) => {
  try {
    const { empleadoId, cursoId } = req.params;
    
    // Verificar permisos
    if (req.user?.rol === 'empleado') {
      // Si es rol empleado, permitir acceso sin verificación adicional
    }
    
    const curso = await cursoService.obtenerCursoPorId(empleadoId, cursoId);
    
    res.status(200).json({
      success: true,
      data: curso
    });
  } catch (error) {
    console.error(error);
    let statusCode = 500;
    if (error.message === 'Empleado no encontrado' || error.message === 'Curso no encontrado') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al obtener el curso'
    });
  }
};

// Actualizar un curso
exports.actualizarCurso = async (req, res) => {
  try {
    const { empleadoId, cursoId } = req.params;
    const { nombre, fechaInicio, fechaFin, tipoDocumento, observaciones } = req.body;
    
    // Verificar campos requeridos
    if (!nombre && !fechaInicio && !fechaFin && !tipoDocumento) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }
    
    // Verificar permisos
    if (req.user?.rol === 'empleado') {
      // Si es rol empleado, permitir acceso sin verificación adicional
    }
    
    const cursoData = {};
    if (nombre) cursoData.nombre = nombre;
    if (fechaInicio) cursoData.fechaInicio = fechaInicio;
    if (fechaFin) cursoData.fechaFin = fechaFin;
    if (tipoDocumento) cursoData.tipoDocumento = tipoDocumento;
    if (observaciones !== undefined) cursoData.observaciones = observaciones;
    
    const cursoActualizado = await cursoService.actualizarCurso(empleadoId, cursoId, cursoData);
    
    res.status(200).json({
      success: true,
      data: cursoActualizado,
      message: 'Curso actualizado correctamente'
    });
  } catch (error) {
    console.error(error);
    let statusCode = 500;
    if (error.message === 'Empleado no encontrado' || error.message === 'Curso no encontrado') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al actualizar el curso'
    });
  }
};

// Eliminar un curso
exports.eliminarCurso = async (req, res) => {
  try {
    const { empleadoId, cursoId } = req.params;
    
    // Solo RRHH pueden eliminar cursos
    if (req.user?.rol === 'empleado') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar cursos'
      });
    }
    
    await cursoService.eliminarCurso(empleadoId, cursoId);
    
    res.status(200).json({
      success: true,
      message: 'Curso eliminado correctamente'
    });
  } catch (error) {
    console.error(error);
    let statusCode = 500;
    if (error.message === 'Empleado no encontrado' || error.message === 'Curso no encontrado') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al eliminar el curso'
    });
  }
};