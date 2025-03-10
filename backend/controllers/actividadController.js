const actividadService = require('../services/actividadService');

// Registrar una nueva actividad
exports.registrarActividad = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { nombre, fecha, participo, observaciones } = req.body;
    
    // Validaciones
    if (!nombre || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y fecha son requeridos'
      });
    }
    
    // Solo RRHH puede registrar actividades
    if (req.user?.rol === 'empleado') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para registrar actividades'
      });
    }
    
    const actividadData = {
      nombre,
      fecha,
      participo: participo === true || participo === "1" || participo === 1,
      observaciones: observaciones || ''
    };
    
    const empleadoActualizado = await actividadService.registrarActividad(empleadoId, actividadData);
    
    res.status(201).json({
      success: true,
      data: empleadoActualizado.actividades[empleadoActualizado.actividades.length - 1],
      message: 'Actividad registrada correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(error.message === 'Empleado no encontrado' ? 404 : 500).json({
      success: false,
      message: error.message || 'Error al registrar actividad'
    });
  }
};

// Obtener todas las actividades de un empleado
exports.obtenerActividades = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    
    // Verificar permisos
    if (req.user?.rol === 'empleado') {
      // Si es rol empleado, permitir acceso sin verificación adicional
      // Esto permite que todos los empleados vean todas las actividades por ahora
    }
    
    const actividades = await actividadService.obtenerActividades(empleadoId);
    
    res.status(200).json({
      success: true,
      count: actividades.length,
      data: actividades
    });
  } catch (error) {
    console.error(error);
    res.status(error.message === 'Empleado no encontrado' ? 404 : 500).json({
      success: false,
      message: error.message || 'Error al obtener actividades'
    });
  }
};

// Obtener una actividad específica
exports.obtenerActividad = async (req, res) => {
  try {
    const { empleadoId, actividadId } = req.params;
    
    // Verificar permisos
    if (req.user?.rol === 'empleado') {
      // Si es rol empleado, permitir acceso sin verificación adicional
    }
    
    const actividad = await actividadService.obtenerActividadPorId(empleadoId, actividadId);
    
    res.status(200).json({
      success: true,
      data: actividad
    });
  } catch (error) {
    console.error(error);
    let statusCode = 500;
    if (error.message === 'Empleado no encontrado' || error.message === 'Actividad no encontrada') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al obtener la actividad'
    });
  }
};

// Actualizar una actividad
exports.actualizarActividad = async (req, res) => {
  try {
    const { empleadoId, actividadId } = req.params;
    const { nombre, fecha, participo, observaciones } = req.body;
    
    // Solo RRHH puede actualizar actividades
    if (req.user?.rol === 'empleado') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar actividades'
      });
    }
    
    const actividadData = {};
    if (nombre) actividadData.nombre = nombre;
    if (fecha) actividadData.fecha = fecha;
    if (participo !== undefined) actividadData.participo = participo === true || participo === "1" || participo === 1;
    if (observaciones !== undefined) actividadData.observaciones = observaciones;
    
    const actividadActualizada = await actividadService.actualizarActividad(empleadoId, actividadId, actividadData);
    
    res.status(200).json({
      success: true,
      data: actividadActualizada,
      message: 'Actividad actualizada correctamente'
    });
  } catch (error) {
    console.error(error);
    let statusCode = 500;
    if (error.message === 'Empleado no encontrado' || error.message === 'Actividad no encontrada') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al actualizar la actividad'
    });
  }
};

// Eliminar una actividad
exports.eliminarActividad = async (req, res) => {
  try {
    const { empleadoId, actividadId } = req.params;
    
    // Solo RRHH puede eliminar actividades
    if (req.user?.rol === 'empleado') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar actividades'
      });
    }
    
    await actividadService.eliminarActividad(empleadoId, actividadId);
    
    res.status(200).json({
      success: true,
      message: 'Actividad eliminada correctamente'
    });
  } catch (error) {
    console.error(error);
    let statusCode = 500;
    if (error.message === 'Empleado no encontrado' || error.message === 'Actividad no encontrada') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al eliminar la actividad'
    });
  }
};