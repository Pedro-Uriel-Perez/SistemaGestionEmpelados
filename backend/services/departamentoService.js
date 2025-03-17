const Departamento = require('../models/Departamento');

// Obtener todos los departamentos
const obtenerDepartamentos = async () => {
  return await Departamento.find().sort({ nombreDepartamento: 1 });
};

// Obtener un departamento por ID
const obtenerDepartamentoPorId = async (id) => {
  return await Departamento.findById(id);
};

// Obtener un departamento por nombre
const obtenerDepartamentoPorNombre = async (nombre) => {
  return await Departamento.findOne({ nombreDepartamento: nombre });
};

// Obtener todos los puestos de un departamento
const obtenerPuestosPorDepartamento = async (departamentoId) => {
  const departamento = await Departamento.findById(departamentoId);
  if (!departamento) {
    throw new Error('Departamento no encontrado');
  }
  return departamento.puestos || [];
};

// Obtener todos los puestos de todos los departamentos
const obtenerTodosLosPuestos = async () => {
  const departamentos = await Departamento.find();
  
  // Crear un mapa con los puestos y sus departamentos
  const puestosMap = new Map();
  
  departamentos.forEach(departamento => {
    departamento.puestos.forEach(puesto => {
      puestosMap.set(puesto, {
        nombre: puesto,
        departamento: {
          _id: departamento._id,
          nombre: departamento.nombreDepartamento
        }
      });
    });
  });
  
  // Convertir el mapa a un array y ordenarlo
  const puestos = Array.from(puestosMap.values());
  return puestos.sort((a, b) => {
    if (a.departamento.nombre !== b.departamento.nombre) {
      return a.departamento.nombre.localeCompare(b.departamento.nombre);
    }
    return a.nombre.localeCompare(b.nombre);
  });
};

module.exports = {
  obtenerDepartamentos,
  obtenerDepartamentoPorId,
  obtenerDepartamentoPorNombre,
  obtenerPuestosPorDepartamento,
  obtenerTodosLosPuestos,
};