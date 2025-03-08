// components/empleados/editar-empleado/editar-empleado.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';

@Component({
  selector: 'app-editar-empleado',
  templateUrl: './editar-empleado.component.html',
  styleUrls: ['./editar-empleado.component.css']
})
export class EditarEmpleadoComponent implements OnInit {
  empleadoForm!: FormGroup;
  empleadoId!: string;
  cargando = false;
  cargandoDatos = true;
  error = '';
  fotoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  
  departamentos = ['Ventas', 'Recursos Humanos', 'Administración', 'TI']; // Temporal hasta implementar catálogos
  puestos = ['Gerente', 'Supervisor', 'Analista', 'Asistente']; // Temporal hasta implementar catálogos
  ciudades = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla']; // Temporal hasta implementar catálogos

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private empleadoService: EmpleadoService
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarEmpleado();
  }

  crearFormulario(): void {
    this.empleadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: ['', Validators.minLength(2)],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fechaIngreso: ['', Validators.required],
      ciudad: ['', Validators.required],
      puesto: ['', Validators.required],
      departamento: ['', Validators.required]
    });
  }

  cargarEmpleado(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    
    this.empleadoService.getEmpleadoPorId(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const empleado = response.data;
          
          // Formatear fechas para el input date
          const fechaNacimiento = empleado.fechaNacimiento ? this.formatearFecha(new Date(empleado.fechaNacimiento)) : '';
          const fechaIngreso = empleado.fechaIngreso ? this.formatearFecha(new Date(empleado.fechaIngreso)) : '';
          
          // Actualizar formulario con datos del empleado
          this.empleadoForm.patchValue({
            nombre: empleado.nombre,
            apellidoPaterno: empleado.apellidoPaterno,
            apellidoMaterno: empleado.apellidoMaterno,
            fechaNacimiento: fechaNacimiento,
            direccion: empleado.direccion,
            telefono: empleado.telefono,
            email: empleado.email,
            fechaIngreso: fechaIngreso,
            ciudad: empleado.ciudad,
            puesto: empleado.puesto,
            departamento: empleado.departamento
          });
          
          // Mostrar foto actual si existe
          if (empleado.foto && empleado.foto !== 'uploads/empleados/default.jpg') {
            this.fotoPreview = `http://localhost:3000/${empleado.foto}`;
          }
        } else {
          this.error = 'No se pudo cargar la información del empleado';
        }
        this.cargandoDatos = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la información del empleado';
        this.cargandoDatos = false;
        console.error(err);
      }
    });
  }

  // Formatear fecha para el input type="date"
  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
      formData.append(key, this.empleadoForm.value[key]);
    });
    
    // Agregar foto si se seleccionó
    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }

    this.empleadoService.actualizarEmpleado(this.empleadoId, formData).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/empleados']);
      },
      error: (err) => {
        this.error = 'Error al actualizar el empleado';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  get nombreNoValido() {
    return this.empleadoForm.get('nombre')?.invalid && this.empleadoForm.get('nombre')?.touched;
  }

  get apellidoPaternoNoValido() {
    return this.empleadoForm.get('apellidoPaterno')?.invalid && this.empleadoForm.get('apellidoPaterno')?.touched;
  }

  // Otros getters para validación
}