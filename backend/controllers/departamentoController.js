const departamentoService = require('../services/departamentoService');



// Obtener todos los departamentos
exports.obtenerDepartamentos = async (req, res) => {
  try {
    const departamentos = await departamentoService.obtenerDepartamentos();
    
    res.status(200).json({
      success: true,
      count: departamentos.length,
      data: departamentos
    });
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener departamentos'
    });
  }
};

// Obtener un departamento por ID
exports.obtenerDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const departamento = await departamentoService.obtenerDepartamentoPorId(id);
    
    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: departamento
    });
  } catch (error) {
    console.error('Error al obtener departamento:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener el departamento'
    });
  }
};

// Obtener puestos de un departamento
exports.obtenerPuestosPorDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const puestos = await departamentoService.obtenerPuestosPorDepartamento(id);
    
    res.status(200).json({
      success: true,
      count: puestos.length,
      data: puestos
    });
  } catch (error) {
    console.error('Error al obtener puestos del departamento:', error);
    let statusCode = 500;
    if (error.message === 'Departamento no encontrado') {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error al obtener puestos del departamento'
    });
  }
};

// Obtener todos los puestos
exports.obtenerTodosLosPuestos = async (req, res) => {
  try {
    const puestos = await departamentoService.obtenerTodosLosPuestos();
    
    res.status(200).json({
      success: true,
      count: puestos.length,
      data: puestos
    });
  } catch (error) {
    console.error('Error al obtener todos los puestos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener todos los puestos'
    });
  }
};