import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth.service';
import { CatalogoService } from '../../services/catalogo.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-crear-empleado',
  templateUrl: './crear-empleado.component.html',
  styleUrls: ['./crear-empleado.component.css']
})
export class CrearEmpleadoComponent implements OnInit {
  empleadoForm!: FormGroup;
  cargando = false;
  error = '';
  exito = '';
  fotoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  password = '';

  // Catálogos
  departamentos: any[] = [];
  puestos: any[] = [];
  ciudades = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla'];
  roles = ['empleado', 'recursosHumanos'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private catalogoService: CatalogoService
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarDepartamentos();
    this.password = this.generarPasswordAleatoria(8);
    
    // Asignar fecha de ingreso automáticamente (fecha actual)
    const fechaActual = new Date();
    this.empleadoForm.get('fechaIngreso')?.setValue(formatDate(fechaActual, 'yyyy-MM-dd', 'en'));
    
    // Escuchar cambios en el departamento seleccionado
    this.empleadoForm.get('departamento')?.valueChanges.subscribe(
      (departamentoId) => {
        if (departamentoId) {
          this.cargarPuestosPorDepartamento(departamentoId);
          this.asignarRolSegunDepartamento(departamentoId);
        } else {
          this.puestos = [];
        }
      }
    );
  }

  cargarDepartamentos(): void {
    this.catalogoService.getDepartamentos().subscribe({
      next: (response) => {
        if (response.success) {
          this.departamentos = response.data;
        }
      },
      error: (err) => console.error('Error al cargar departamentos:', err)
    });
  }
  cargarPuestosPorDepartamento(departamentoId: string): void {
    this.catalogoService.getPuestosPorDepartamento(departamentoId).subscribe({
      next: (response) => {
        if (response.success) {
          // Ahora los puestos son un array de strings
          this.puestos = response.data;
          
          // Limpiar el puesto seleccionado cuando cambia el departamento
          this.empleadoForm.get('puesto')?.setValue('');
        }
      },
      error: (err) => console.error('Error al cargar puestos:', err)
    });
  }
  

  asignarRolSegunDepartamento(departamentoId: string): void {
    // Buscar el departamento seleccionado
    const departamento = this.departamentos.find(d => d._id === departamentoId);
    
    // Asignar rol automáticamente según el departamento
    if (departamento && departamento.esRecursosHumanos) {
      this.empleadoForm.get('rol')?.setValue('recursosHumanos');
    } else {
      this.empleadoForm.get('rol')?.setValue('empleado');
    }
  }

  crearFormulario(): void {
    // Fecha actual para asignar a fechaIngreso
    const fechaActual = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    
    this.empleadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: ['', Validators.minLength(2)],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      direccion: ['', Validators.required], 
      numeroExterior: [''],
      numeroInterior: [''],
      colonia: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      ciudad: ['', Validators.required],
      telefonos: this.fb.array([this.fb.control('', Validators.required)]),
      email: ['', [Validators.required, Validators.email]],
      referenciasFamiliares: this.fb.array([]),
      fechaIngreso: [fechaActual, Validators.required],
      puesto: ['', Validators.required],
      departamento: ['', Validators.required],
      rol: ['empleado', Validators.required]
    });
  }

  get telefonosArray() { return this.empleadoForm.get('telefonos') as FormArray; }
  get referenciasFamiliaresArray() { return this.empleadoForm.get('referenciasFamiliares') as FormArray; }

  agregarTelefono() { this.telefonosArray.push(this.fb.control('', Validators.required)); }
  eliminarTelefono(index: number) { if (this.telefonosArray.length > 1) this.telefonosArray.removeAt(index); }

  agregarReferencia() {
    this.referenciasFamiliaresArray.push(this.fb.group({
      nombre: ['', Validators.required],
      parentesco: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', Validators.email]
    }));
  }
  
  eliminarReferencia(index: number) { this.referenciasFamiliaresArray.removeAt(index); }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.fotoPreview = reader.result; };
      reader.readAsDataURL(file);
    }
  }

  generarNuevaPassword(): void { this.password = this.generarPasswordAleatoria(8); }

  generarPasswordAleatoria(longitud: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array(longitud).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }
  
  // Método para marcar todos los campos como tocados
  marcarTodosComoTocados(): void {
    Object.keys(this.empleadoForm.controls).forEach(key => {
      const control = this.empleadoForm.get(key);
      
      if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            Object.keys(ctrl.controls).forEach(k => ctrl.get(k)?.markAsTouched());
          } else {
            ctrl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      this.marcarTodosComoTocados();
      return;
    }
  
    this.cargando = true;
    this.error = '';
    
    const formData = new FormData();
    
    // Crear una copia del formulario y asegurar que tiene la fecha de ingreso actual
    const formValues = {...this.empleadoForm.value};
    const today = new Date();
    formValues.fechaIngreso = formatDate(today, 'yyyy-MM-dd', 'en');
    
    // Preparar los datos asegurando que se usan los nombres en lugar de IDs
    const empleadoData = this.prepararDatosEmpleado(formValues);
    
    // Agregar los campos principales
    formData.append('departamento', String(empleadoData['departamento']).trim());
    formData.append('puesto', String(empleadoData['puesto']).trim());
    
    // Agregar el resto de campos al FormData
    Object.keys(empleadoData).forEach(key => {
      if (key !== 'rol' && key !== 'departamento' && key !== 'puesto') {
        const value = empleadoData[key];
        
        if (value !== undefined) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== null) {
            formData.append(key, String(value));
          }
        }
      }
    });
    
    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }
  
    this.empleadoService.crearEmpleado(formData).subscribe({
      next: (response) => {
        const usuarioData = {
          empleadoId: response.data._id,
          username: this.empleadoForm.get('email')?.value,
          password: this.password,
          rol: this.empleadoForm.get('rol')?.value
        };
  
        this.authService.crearUsuario(usuarioData).subscribe({
          next: (userResponse) => {
            this.cargando = false;
            this.exito = `Empleado y usuario creados exitosamente.${userResponse.emailEnviado ? 
              ' Se han enviado las credenciales al correo del empleado.' : 
              ' No se pudieron enviar las credenciales por correo. Notifique al empleado manualmente.'}`;
            setTimeout(() => this.router.navigate(['/empleados']), 3000);
          },
          error: (err) => {
            console.error('Error al crear usuario:', err);
            this.cargando = false;
            this.error = err.error?.message || 'Error al crear el usuario. El empleado fue creado pero necesitará crear el usuario manualmente.';
          }
        });
      },
      error: (err) => {
        console.error('Error al crear empleado:', err);
        this.error = err.error?.message || 'Error al crear el empleado';
        this.cargando = false;
      }
    });
  }
  
prepararDatosEmpleado(formValues: any): Record<string, any> {
  // Procesar teléfonos
  const telefonos = formValues.telefonos.map((tel: string) => ({
    numero: tel,
    tipo: 'Personal'
  }));
  
  // Crear dirección completa
  const direccion = `${formValues.direccion}, ${formValues.numeroExterior || 'S/N'}${formValues.numeroInterior ? ' Int. ' + formValues.numeroInterior : ''}, ${formValues.colonia}, ${formValues.codigoPostal}`;
  
  // Encontrar los nombres de departamento y puesto basados en los IDs seleccionados
  const departamentoSeleccionado = this.departamentos.find(d => d._id === formValues.departamento);
  
  // Con la nueva estructura, el puesto es un string seleccionado directamente
  const puesto = formValues.puesto;
  
  return { 
    nombre: formValues.nombre,
    apellidoPaterno: formValues.apellidoPaterno,
    apellidoMaterno: formValues.apellidoMaterno || '',
    fechaNacimiento: formValues.fechaNacimiento,
    sexo: formValues.sexo,
    direccion,
    ciudad: formValues.ciudad,
    codigoPostal: formValues.codigoPostal,
    colonia: formValues.colonia,
    email: formValues.email,
    telefonos,
    referenciasFamiliares: formValues.referenciasFamiliares || [],
    departamento: departamentoSeleccionado ? departamentoSeleccionado.nombreDepartamento : '',
    puesto,
    fechaIngreso: formValues.fechaIngreso,
    rol: formValues.rol
  };
}
  volverALista(): void { this.router.navigate(['/empleados']); }

  // Getters para validaciones de campos
  get nombreNoValido() { return this.empleadoForm.get('nombre')?.invalid && this.empleadoForm.get('nombre')?.touched; }
  get apellidoPaternoNoValido() { return this.empleadoForm.get('apellidoPaterno')?.invalid && this.empleadoForm.get('apellidoPaterno')?.touched; }
  get fechaNacimientoNoValido() { return this.empleadoForm.get('fechaNacimiento')?.invalid && this.empleadoForm.get('fechaNacimiento')?.touched; }
  get sexoNoValido() { return this.empleadoForm.get('sexo')?.invalid && this.empleadoForm.get('sexo')?.touched; }
  get direccionNoValida() { return this.empleadoForm.get('direccion')?.invalid && this.empleadoForm.get('direccion')?.touched; }
  get coloniaNoValida() { return this.empleadoForm.get('colonia')?.invalid && this.empleadoForm.get('colonia')?.touched; }
  get codigoPostalNoValido() { return this.empleadoForm.get('codigoPostal')?.invalid && this.empleadoForm.get('codigoPostal')?.touched; }
  get ciudadNoValida() { return this.empleadoForm.get('ciudad')?.invalid && this.empleadoForm.get('ciudad')?.touched; }
  get emailNoValido() { return this.empleadoForm.get('email')?.invalid && this.empleadoForm.get('email')?.touched; }
  get fechaIngresoNoValida() { return this.empleadoForm.get('fechaIngreso')?.invalid && this.empleadoForm.get('fechaIngreso')?.touched; }
  get puestoNoValido() { return this.empleadoForm.get('puesto')?.invalid && this.empleadoForm.get('puesto')?.touched; }
  get departamentoNoValido() { return this.empleadoForm.get('departamento')?.invalid && this.empleadoForm.get('departamento')?.touched; }
}