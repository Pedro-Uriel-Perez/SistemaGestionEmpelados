const mongoose = require('mongoose');

const ActividadSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Actividad', ActividadSchema, 'actividads');
