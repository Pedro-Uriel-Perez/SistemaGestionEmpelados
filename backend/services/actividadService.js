const Empleado = require('../models/Empleado');

// Obtener actividades de un empleado
const obtenerActividades = async (empleadoId) => {
  const empleado = await Empleado.findById(empleadoId);
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  return empleado.actividades || [];
};

// Obtener una actividad específica
const obtenerActividadPorId = async (empleadoId, actividadId) => {
  const empleado = await Empleado.findById(empleadoId);
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  const actividad = empleado.actividades.id(actividadId);
  if (!actividad) {
    throw new Error('Actividad no encontrada');
  }
  return actividad;
};

module.exports = {
  obtenerActividades,
  obtenerActividadPorId
};