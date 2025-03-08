const Empleado = require('../models/Empleado');

// Generar clave automática
const generarClave = async (nombre, apellidoPaterno, apellidoMaterno) => {
  let iniciales = '';
  
  // Obtener iniciales
  if (nombre) iniciales += nombre.substring(0, 2).toUpperCase();
  if (apellidoPaterno) iniciales += apellidoPaterno.charAt(0).toUpperCase();
  if (apellidoMaterno) iniciales += apellidoMaterno.charAt(0).toUpperCase();
  
  // Obtener consecutivo
  const ultimoEmpleado = await Empleado.findOne().sort({ createdAt: -1 });
  let consecutivo = 1;
  
  if (ultimoEmpleado && ultimoEmpleado.clave) {
    const partes = ultimoEmpleado.clave.split('-');
    if (partes.length > 1) {
      const ultimoConsecutivo = parseInt(partes[1]);
      if (!isNaN(ultimoConsecutivo)) {
        consecutivo = ultimoConsecutivo + 1;
      }
    }
  }
  
  return `${iniciales}-${String(consecutivo).padStart(4, '0')}`;
};

// Generar RFC
const generarRFC = (nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento) => {
  let rfc = '';
  
  // Obtener letras
  if (apellidoPaterno) rfc += apellidoPaterno.substring(0, 2).toUpperCase();
  else rfc += 'XX';
  
  if (apellidoMaterno) rfc += apellidoMaterno.charAt(0).toUpperCase();
  else rfc += 'X';
  
  if (nombre) rfc += nombre.charAt(0).toUpperCase();
  else rfc += 'X';
  
  // Obtener fecha
  let fecha = '000000';
  if (fechaNacimiento) {
    const date = new Date(fechaNacimiento);
    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    fecha = `${year}${month}${day}`;
  }
  
  return `${rfc}-${fecha}`;
};

// Crear empleado
const crearEmpleado = async (empleadoData, fotoPath) => {
  const { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, ...resto } = empleadoData;
  
  // Generar clave y RFC
  const clave = await generarClave(nombre, apellidoPaterno, apellidoMaterno);
  const rfc = generarRFC(nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento);
  
  // Crear empleado
  const empleado = new Empleado({
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    fechaNacimiento,
    clave,
    rfc,
    ...resto,
    foto: fotoPath ? fotoPath.replace(/\\/g, '/') : 'uploads/empleados/default.jpg',
    estado: 'Activo'
  });
  
  return await empleado.save();
};

// Obtener empleados con filtros
const obtenerEmpleados = async (filtros = {}) => {
  const { nombre, departamento, puesto, estado, clave } = filtros;
  const filtro = {};
  
  if (nombre) filtro.nombre = { $regex: nombre, $options: 'i' };
  if (departamento) filtro.departamento = departamento;
  if (puesto) filtro.puesto = puesto;
  if (estado) filtro.estado = estado;
  if (clave) filtro.clave = clave;
  
  return await Empleado.find(filtro).sort({ createdAt: -1 });
};

// Obtener empleado por ID
const obtenerEmpleadoPorId = async (id) => {
  return await Empleado.findById(id);
};

// Actualizar empleado
const actualizarEmpleado = async (id, datos, fotoPath) => {
  // Si hay nueva foto, actualizar ruta
  if (fotoPath) {
    datos.foto = fotoPath.replace(/\\/g, '/');
  }
  
  return await Empleado.findByIdAndUpdate(
    id,
    datos,
    { new: true, runValidators: true }
  );
};

// Eliminar empleado
const eliminarEmpleado = async (id) => {
  const empleado = await Empleado.findById(id);
  if (empleado) {
    await Empleado.findByIdAndDelete(id);
    return true;
  }
  return false;
};

// Cambiar estado de empleado
const cambiarEstado = async (id, datos) => {
  const { tipo, fecha, motivo, fechaRetorno } = datos;
  
  const empleado = await Empleado.findById(id);
  
  if (!empleado) {
    return null;
  }
  
  // Agregar registro de baja
  empleado.bajas.push({
    fecha,
    tipo,
    motivo,
    fechaRetorno: tipo === 'Temporal' ? fechaRetorno : null
  });
  
  // Actualizar estado
  empleado.estado = tipo === 'Temporal' ? 'BajaTemporal' : 'BajaDefinitiva';
  
  return await empleado.save();
};

module.exports = {
  generarClave,
  generarRFC,
  crearEmpleado,
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  eliminarEmpleado,
  cambiarEstado
};