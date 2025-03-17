const mongoose = require('mongoose');

// Esquema de Empleado
const EmpleadoSchema = new mongoose.Schema({
  clave: {
    type: String,
    required: true,
    unique: true
  },
  rfc: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellidoPaterno: {
    type: String,
    required: true
  },
  apellidoMaterno: {
    type: String,
    required: true
  },
  fechaNacimiento: {
    type: Date,
    required: true
  },
  sexo: {
    type: String,
    enum: ['Masculino', 'Femenino'],
    required: true
  },
  foto: {
    type: String,
    default: 'uploads/empleados/default.jpg'
  },
  direccion: String,
  telefono: String,
  email: String,
  fechaIngreso: {
    type: Date,
    default: new Date()
  },
  ciudad: String,
  puesto: {
    type: String,
    required: true
  },
  departamento: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['Activo', 'BajaTemporal', 'BajaDefinitiva'],
    default: 'Activo'
  },
  bajas: [{
    fecha: Date,
    tipo: String,
    motivo: String,
    fechaRetorno: Date
  }],
  cursos: [{
    nombre: String,
    fechaInicio: Date,
    fechaFin: Date,
    tipoDocumento: String
  }],
  actividades: [{
    nombre: String,
    fecha: Date,
    participo: Boolean
  }],
  telefonos: [{
    numero: String,
    tipo: String
  }],
  correos: [{
    email: String,
    tipo: String
  }],
  referenciasFamiliares: [{
    nombre: String,
    parentesco: String,
    telefono: String,
    email: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Empleado', EmpleadoSchema);