const mongoose = require('mongoose');

const DepartamentoSchema = new mongoose.Schema({
  nombreDepartamento: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  esRecursosHumanos: {
    type: Boolean,
    default: false
  },
  puestos: [{
    type: String,
    trim: true
  }]
})

module.exports = mongoose.model('Departamento', DepartamentoSchema);
