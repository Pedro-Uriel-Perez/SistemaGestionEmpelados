// controllers/catalogoController.js

// Obtener departamentos
exports.obtenerDepartamentos = async (req, res) => {
    try {
      // Datos de departamentos fijos (mientras creas los modelos)
      const departamentos = [
        { _id: '1', nombre: 'Ventas' },
        { _id: '2', nombre: 'Recursos Humanos' },
        { _id: '3', nombre: 'Administración' },
        { _id: '4', nombre: 'TI' }
      ];
      
      res.status(200).json({
        success: true,
        count: departamentos.length,
        data: departamentos
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener departamentos',
        error: error.message
      });
    }
  };
  
  // Obtener puestos
  exports.obtenerPuestos = async (req, res) => {
    try {
      // Datos de puestos fijos
      const puestos = [
        { _id: '1', nombre: 'Gerente' },
        { _id: '2', nombre: 'Supervisor' },
        { _id: '3', nombre: 'Analista' },
        { _id: '4', nombre: 'Asistente' }
      ];
      
      res.status(200).json({
        success: true,
        count: puestos.length,
        data: puestos
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener puestos',
        error: error.message
      });
    }
  };
  
  // Obtener ciudades
  exports.obtenerCiudades = async (req, res) => {
    try {
      // Datos de ciudades fijos
      const ciudades = [
        { _id: '1', nombre: 'Ciudad de México', estado: 'CDMX' },
        { _id: '2', nombre: 'Guadalajara', estado: 'Jalisco' },
        { _id: '3', nombre: 'Monterrey', estado: 'Nuevo León' },
        { _id: '4', nombre: 'Puebla', estado: 'Puebla' }
      ];
      
      res.status(200).json({
        success: true,
        count: ciudades.length,
        data: ciudades
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ciudades',
        error: error.message
      });
    }
  };