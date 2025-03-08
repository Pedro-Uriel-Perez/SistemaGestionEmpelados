export interface Usuario {
    _id?: string;
    username: string;
    password?: string;
    rol: 'admin' | 'recursosHumanos' | 'empleado';
    empleado?: string;
  }
  
  export interface LoginResponse {
    user: Usuario;
    token: string;
  }