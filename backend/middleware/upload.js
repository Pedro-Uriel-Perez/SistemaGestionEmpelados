const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/empleados/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `empleado-${uniqueSuffix}${extension}`);
  }
});

// Filtro para solo aceptar imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Solo se permiten archivos de imagen'));
};

// Exportar configuración de multer
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB máximo
  fileFilter: fileFilter
});

module.exports = upload;