// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Crear un transportador de correo con las credenciales
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función para enviar correo electrónico con credenciales
const enviarCredencialesPorEmail = async (nombre, email, username, password) => {
    try {
      console.log('Intentando enviar correo a:', email);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Credenciales de acceso al Sistema de Gestión de Empleados',
        text: `
          Hola ${nombre},

          Se ha creado una cuenta para ti en el Sistema de Gestión de Empleados.
          
          Tus credenciales de acceso son:
          Usuario: ${username}
          Contraseña : ${password}
        `
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado correctamente:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error detallado al enviar correo:', error);
      return false;
    }
};

module.exports = {
  enviarCredencialesPorEmail
};
