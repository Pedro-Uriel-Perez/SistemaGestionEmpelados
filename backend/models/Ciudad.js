const mongoose = require('mongoose');

const CiudadSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  estado: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ciudad', CiudadSchema);