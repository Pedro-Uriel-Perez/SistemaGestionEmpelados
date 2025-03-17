const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const empleadosRoutes = require('./routes/empleados');
const cursosRoutes = require('./routes/cursos');
const actividadesRoutes = require('./routes/actividades');
require('dotenv').config();

// Inicializar app
const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Configurar carpeta para archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadosRoutes);

// Rutas de cursos y actividades
app.use('/api/empleados', cursosRoutes);

app.use('/api/actividades', actividadesRoutes);

app.use('/api/departamentos', require('./routes/departamentos'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));