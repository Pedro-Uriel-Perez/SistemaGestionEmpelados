const Empleado = require('../models/Empleado');

// Agregar curso a un empleado
const agregarCurso = async (empleadoId, cursoData) => {
  const empleado = await Empleado.findById(empleadoId);
  
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  empleado.cursos.push(cursoData);
  return await empleado.save();
};

// Obtener cursos de un empleado
const obtenerCursos = async (empleadoId) => {
  const empleado = await Empleado.findById(empleadoId);
  
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  return empleado.cursos || [];
};

// Obtener un curso específico
const obtenerCursoPorId = async (empleadoId, cursoId) => {
  const empleado = await Empleado.findById(empleadoId);
  
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  const curso = empleado.cursos.id(cursoId);
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  return curso;
};

// Actualizar un curso
const actualizarCurso = async (empleadoId, cursoId, cursoData) => {
  const empleado = await Empleado.findById(empleadoId);
  
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  const curso = empleado.cursos.id(cursoId);
  if (!curso) {
    throw new Error('Curso no encontrado');
  }
  
  // Actualizar campos
  Object.keys(cursoData).forEach(key => {
    curso[key] = cursoData[key];
  });
  
  await empleado.save();
  return curso;
};

// Eliminar un curso
const eliminarCurso = async (empleadoId, cursoId) => {
  const empleado = await Empleado.findById(empleadoId);
  
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }
  
  const cursoIndex = empleado.cursos.findIndex(curso => curso._id.toString() === cursoId);
  
  if (cursoIndex === -1) {
    throw new Error('Curso no encontrado');
  }
  
  empleado.cursos.splice(cursoIndex, 1);
  await empleado.save();
  return true;
};

module.exports = {
  agregarCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso
};