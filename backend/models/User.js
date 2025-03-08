// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'recursosHumanos', 'empleado'],
    default: 'empleado'
  },
  empleado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empleado'
  },
  requiereCambioPassword: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);