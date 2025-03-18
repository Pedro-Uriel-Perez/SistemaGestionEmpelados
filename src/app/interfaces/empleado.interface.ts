export interface Empleado {
    _id: string;
    clave: string;
    rfc: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    sexo: string;  
    foto?: string;
    direccion: string;
    telefono: string; 
    telefonos: Telefono[];  // mltiples teléfonos
    email: string;
    fechaIngreso: string;
    ciudad: string;
    puesto: string;
    departamento: string;
    estado: string;
    rol?: string;  
    bajas?: Baja[];
    cursos?: Curso[];
    actividades?: Actividad[];
    referenciasFamiliares?: ReferenciaFamiliar[];
  }
  
  export interface Telefono {
    numero: string;
    tipo: string;
  }
  
  export interface Baja {
    fecha: string;
    tipo: string;
    motivo: string;
    fechaRetorno?: string;
  }
  
  export interface Curso {
    _id?: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    documento?: string;
    tipoDocumento?: string;
    observaciones?: string;
  }
  
  export interface Actividad {
    _id?: string;
    nombre: string;
    fecha: string;
    participacion?: boolean;
    participo?: boolean;
    observaciones?: string;
  }
  
  export interface ReferenciaFamiliar {
    _id?: string;
    nombre: string;
    parentesco: string;
    telefono: string;
    email?: string;
  }