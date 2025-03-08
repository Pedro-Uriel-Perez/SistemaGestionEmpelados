// components/empleados/crear-empleado/crear-empleado.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  password: string = '';

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
    // Generar una contraseña aleatoria inicial
    this.password = this.generarPasswordAleatoria(8);
  }

  crearFormulario(): void {
    this.empleadoForm = this.fb.group({
      // Datos personales
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: ['', Validators.minLength(2)],
      fechaNacimiento: ['', Validators.required],
      
      // Datos de contacto
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      ciudad: ['', Validators.required],
      
      // Datos laborales
      fechaIngreso: ['', Validators.required],
      puesto: ['', Validators.required],
      departamento: ['', Validators.required],
      
      // Datos de usuario
      rol: ['empleado', Validators.required]
    });
  }

  // Manejar selección de archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  generarNuevaPassword(): void {
    this.password = this.generarPasswordAleatoria(8);
  }

  generarPasswordAleatoria(longitud: number): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let resultado = '';
    const caracteresLength = caracteres.length;
    
    for (let i = 0; i < longitud; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLength));
    }
    
    return resultado;
  }

  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      return;
    }

    this.cargando = true;
    this.error = '';

    // Crear FormData para enviar datos y archivo
    const formData = new FormData();
    
    // Agregar todos los campos del formulario
    Object.keys(this.empleadoForm.value).forEach(key => {
      // No enviamos el rol al crear el empleado
      if (key !== 'rol') {
        formData.append(key, this.empleadoForm.value[key]);
      }
    });
    
    // Agregar foto si se seleccionó
    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }

    // Primero crear el empleado
    this.empleadoService.crearEmpleado(formData).subscribe({
      next: (response) => {
        const empleadoId = response.data._id;
        
        // Ahora crear el usuario para este empleado
        const usuarioData = {
          empleadoId: empleadoId,
          username: this.empleadoForm.get('email')?.value,
          password: this.password,
          rol: this.empleadoForm.get('rol')?.value
        };

        // Crear el usuario
        this.authService.crearUsuario(usuarioData).subscribe({
          next: (userResponse) => {
            this.cargando = false;
            
            let mensaje = 'Empleado y usuario creados exitosamente.';
            if (userResponse.emailEnviado) {
              mensaje += ' Se han enviado las credenciales al correo del empleado.';
            } else {
              mensaje += ' No se pudieron enviar las credenciales por correo. Notifique al empleado manualmente.';
            }
            
            this.exito = mensaje;
            
            // Redirigir después de unos segundos
            setTimeout(() => {
              this.router.navigate(['/empleados']);
            }, 3000);
          },
          error: (err) => {
            this.cargando = false;
            this.error = err.error?.message || 'Error al crear el usuario. El empleado fue creado pero necesitará crear el usuario manualmente.';
          }
        });
      },
      error: (err) => {
        this.error = 'Error al crear el empleado';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  volverALista(): void {
    this.router.navigate(['/empleados']);
  }

  get nombreNoValido() {
    return this.empleadoForm.get('nombre')?.invalid && this.empleadoForm.get('nombre')?.touched;
  }

  get apellidoPaternoNoValido() {
    return this.empleadoForm.get('apellidoPaterno')?.invalid && this.empleadoForm.get('apellidoPaterno')?.touched;
  }

  // Otros getters para validación
}