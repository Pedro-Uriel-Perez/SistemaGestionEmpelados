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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">Bienvenido(a) ${nombre}</h2>
            <p>Se ha creado una cuenta para ti en el Sistema de Gestión de Empleados.</p>
            <p>Tus credenciales de acceso son:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Usuario:</strong> ${username}</p>
              <p><strong>Contraseña temporal:</strong> ${password}</p>
            </div>
            <p>Por seguridad, te recomendamos cambiar tu contraseña la primera vez que inicies sesión.</p>
            <p>Para acceder al sistema, visita: <a href="http://localhost:4200/login">Sistema de Gestión</a></p>
            <p style="color: #777; font-size: 12px; margin-top: 30px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
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