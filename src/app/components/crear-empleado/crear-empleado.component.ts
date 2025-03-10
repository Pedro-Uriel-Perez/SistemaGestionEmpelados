import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth.service';

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
  departamentos = ['Ventas', 'Recursos Humanos', 'Administración', 'TI'];
  puestos = ['Gerente', 'Supervisor', 'Analista', 'Asistente'];
  ciudades = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla'];
  roles = ['empleado', 'recursosHumanos'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private empleadoService: EmpleadoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.password = this.generarPasswordAleatoria(8);
  }

  crearFormulario(): void {
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
      fechaIngreso: ['', Validators.required],
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    return Array(longitud).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      this.marcarTodosComoTocados();
      return;
    }

    this.cargando = true;
    this.error = '';
    const formData = new FormData();
    const empleadoData = this.prepararDatosEmpleado();
    
    Object.entries(empleadoData).forEach(([key, value]) => {
      if (key !== 'rol' && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    
    if (this.selectedFile) formData.append('foto', this.selectedFile);

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
            this.cargando = false;
            this.error = err.error?.message || 'Error al crear el usuario. El empleado fue creado pero necesitará crear el usuario manualmente.';
          }
        });
      },
      error: () => {
        this.error = 'Error al crear el empleado';
        this.cargando = false;
      }
    });
  }

  marcarTodosComoTocados() {
    Object.values(this.empleadoForm.controls).forEach(control => {
      if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            Object.values(ctrl.controls).forEach(c => c.markAsTouched());
          } else {
            ctrl.markAsTouched();
          }
        });
      } else {
        control.markAsTouched();
      }
    });
  }

  prepararDatosEmpleado() {
    const formValues = this.empleadoForm.value;
    const telefonos = formValues.telefonos.map((tel: string) => ({ numero: tel, tipo: 'Personal' }));
    const direccion = `${formValues.direccion}, ${formValues.numeroExterior || 'S/N'}${formValues.numeroInterior ? ' Int. ' + formValues.numeroInterior : ''}, ${formValues.colonia}, ${formValues.codigoPostal}, ${formValues.ciudad}`;
    
    return { ...formValues, direccion, telefonos, sexo: formValues.sexo };
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