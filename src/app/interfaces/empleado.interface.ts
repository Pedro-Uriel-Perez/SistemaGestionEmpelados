export interface Empleado {
    _id: string;
    clave: string;
    rfc: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    foto?: string;
    direccion: string;
    telefono: string;
    email: string;
    fechaIngreso: string;
    ciudad: string;
    puesto: string;
    departamento: string;
    estado: string;
    bajas?: Baja[];
    cursos?: Curso[];
    actividades?: Actividad[];
    referenciasFamiliares?: ReferenciaFamiliar[];
  }
  
  export interface Baja {
    fecha: string;
    tipo: string;
    motivo: string;
    fechaRetorno?: string;
  }
  
  export interface Curso {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    documento?: string;
  }
  
  export interface Actividad {
    nombre: string;
    fecha: string;
    participacion?: boolean;
  }
  
  export interface ReferenciaFamiliar {
    nombre: string;
    parentesco: string;
    telefono: string;
    email?: string;
  }