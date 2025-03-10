const Empleado = require('../models/Empleado');

// Generar clave automática
const generarClave = async (nombre, apellidoPaterno, apellidoMaterno) => {
  let iniciales = '';
  if (nombre) iniciales += nombre.substring(0, 2).toUpperCase();
  if (apellidoPaterno) iniciales += apellidoPaterno.charAt(0).toUpperCase();
  if (apellidoMaterno) iniciales += apellidoMaterno.charAt(0).toUpperCase();
  
  const ultimoEmpleado = await Empleado.findOne().sort({ createdAt: -1 });
  let consecutivo = 1;
  
  if (ultimoEmpleado?.clave) {
    const partes = ultimoEmpleado.clave.split('-');
    if (partes.length > 1) {
      const num = parseInt(partes[1]);
      if (!isNaN(num)) consecutivo = num + 1;
    }
  }
  
  return `${iniciales}-${String(consecutivo).padStart(4, '0')}`;
};

// Generar RFC
const generarRFC = (nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento) => {
  let rfc = '';
  rfc += apellidoPaterno ? apellidoPaterno.substring(0, 2).toUpperCase() : 'XX';
  rfc += apellidoMaterno ? apellidoMaterno.charAt(0).toUpperCase() : 'X';
  rfc += nombre ? nombre.charAt(0).toUpperCase() : 'X';
  
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
  const { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, sexo, ...resto } = empleadoData;
  
  if (!sexo || !['Masculino', 'Femenino'].includes(sexo)) {
    throw new Error('El campo sexo es requerido y debe ser "Masculino" o "Femenino"');
  }
  
  const fechaNac = fechaNacimiento instanceof Date ? fechaNacimiento : new Date(fechaNacimiento);
  const clave = await generarClave(nombre, apellidoPaterno, apellidoMaterno);
  const rfc = generarRFC(nombre, apellidoPaterno, apellidoMaterno, fechaNac);
  
  // Procesar teléfonos
  let telefonos = [];
  if (resto.telefonos) {
    const data = typeof resto.telefonos === 'string' ? JSON.parse(resto.telefonos) : resto.telefonos;
    const array = Array.isArray(data) ? data : [data];
    
    telefonos = array.map(tel => {
      if (typeof tel === 'string') return { numero: tel, tipo: 'Personal' };
      if (tel?.numero) return { numero: tel.numero, tipo: tel.tipo || 'Personal' };
      return { numero: '', tipo: 'Personal' };
    });
  }
  
  // Procesar referencias familiares
  let referencias = [];
  if (resto.referenciasFamiliares) {
    const data = typeof resto.referenciasFamiliares === 'string' ? 
                 JSON.parse(resto.referenciasFamiliares) : resto.referenciasFamiliares;
    const array = Array.isArray(data) ? data : [data];
    
    referencias = array
      .filter(ref => ref && typeof ref === 'object')
      .map(ref => ({
        nombre: String(ref.nombre || ''),
        parentesco: String(ref.parentesco || ''),
        telefono: String(ref.telefono || ''),
        email: String(ref.email || '')
      }));
  }
  
  // Crear empleado
  const empleado = new Empleado({
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    fechaNacimiento: fechaNac,
    sexo,
    clave,
    rfc,
    ...resto,
    telefonos,
    referenciasFamiliares: referencias,
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
const obtenerEmpleadoPorId = async (id) => await Empleado.findById(id);

// Actualizar empleado
const actualizarEmpleado = async (id, datos, fotoPath) => {
  if (fotoPath) datos.foto = fotoPath.replace(/\\/g, '/');
  
  // Parsear campos JSON
  ['telefonos', 'referenciasFamiliares', 'cursos', 'actividades', 'bajas'].forEach(campo => {
    if (datos[campo] && typeof datos[campo] === 'string') {
      try { datos[campo] = JSON.parse(datos[campo]); } catch (e) {}
    }
  });
  
  // Asegurar campo sexo
  if (!datos.sexo) {
    const empleado = await Empleado.findById(id);
    datos.sexo = empleado?.sexo || 'Masculino';
  }
  
  return await Empleado.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
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
  
  if (!empleado) return null;
  
  empleado.bajas.push({
    fecha,
    tipo,
    motivo,
    fechaRetorno: tipo === 'Temporal' ? fechaRetorno : null
  });
  
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