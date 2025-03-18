const Actividad = require('../models/Actividad');
const Empleado = require('../models/Empleado');

// Listar todas las actividades del catálogo
exports.listarActividades = async (req, res) => {
  try {
    const actividades = await Actividad.find().sort({ fecha: -1 });
    res.status(200).json({ success: true, data: actividades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener actividades' });
  }
};

// Crear una actividad en el catálogo
exports.crearActividad = async (req, res) => {
  try {
    const { nombre, fecha, descripcion } = req.body;
    if (!nombre || !fecha) {
      return res.status(400).json({ success: false, message: 'Nombre y fecha son requeridos' });
    }
    const actividad = await Actividad.create({ nombre, fecha, descripcion: descripcion || '' });
    res.status(201).json({ success: true, data: actividad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear actividad' });
  }
};

// Asignar actividad a un empleado
exports.asignarActividad = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { actividadId } = req.body;
    const [actividad, empleado] = await Promise.all([
      Actividad.findById(actividadId),
      Empleado.findById(empleadoId)
    ]);
    if (!actividad) {
      return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
    }
    if (!empleado) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    } 
    if (empleado.actividades.some(act => act.actividadId?.toString() === actividadId)) {
      return res.status(400).json({ success: false, message: 'La actividad ya está asignada a este empleado' });
    }
    empleado.actividades.push({actividadId, nombre: actividad.nombre, fecha: actividad.fecha, participo: false, observaciones: ''});
    
    await empleado.save();

    res.status(200).json({
      success: true,
      message: 'Actividad asignada correctamente',
      data: empleado.actividades[empleado.actividades.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al asignar actividad' });
  }
};

// Actualizar participación
exports.actualizarParticipacion = async (req, res) => {
  try {
    const { empleadoId, actividadId } = req.params;
    const { participo, observaciones } = req.body;
    const empleado = await Empleado.findById(empleadoId);
    if (!empleado) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    const actividad = empleado.actividades.id(actividadId);
    if (!actividad) {
      return res.status(404).json({ success: false, message: 'Actividad no encontrada' });
    }
    actividad.participo = Boolean(participo);
    if (observaciones !== undefined) {
      actividad.observaciones = observaciones;
    }
    
    await empleado.save();
    
    res.status(200).json({
      success: true, 
      message: 'Participación actualizada correctamente', 
      data: actividad
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al actualizar participación' });
  }
};

// Obtener actividades de un empleado
exports.obtenerActividadesEmpleado = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const empleado = await Empleado.findById(empleadoId);
    if (!empleado) {
      return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    }
    res.status(200).json({ success: true, data: empleado.actividades || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener actividades' });
  }
};