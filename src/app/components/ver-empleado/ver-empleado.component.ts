import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth.service';
import { Empleado } from '../../interfaces/empleado.interface';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-ver-empleado',
  templateUrl: './ver-empleado.component.html',
  styleUrls: ['./ver-empleado.component.css']
})
export class VerEmpleadoComponent implements OnInit {
  empleado: Empleado | null = null;
  empleadoId: string = '';
  cargando: boolean = true;
  procesando: boolean = false;
  error: string = '';
  exito: string = '';
  canEdit: boolean = false;
  isOwnProfile: boolean = false;
  
  // Formularios
  bajaForm: FormGroup;
  reingresoForm: FormGroup;
  
  // Referencias a modales
  modalBaja: any;
  modalReingreso: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    // Inicializar formularios
    this.bajaForm = this.fb.group({
      tipo: ['Temporal', Validators.required],
      fecha: [this.getFechaActual(), Validators.required],
      fechaRetorno: [''],
      motivo: ['', Validators.required]
    });
    
    this.reingresoForm = this.fb.group({
      fecha: [this.getFechaActual(), Validators.required],
      motivo: ['', Validators.required]
    });
    
    // Actualizar validadores cuando cambia el tipo de baja
    this.bajaForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const fechaRetornoControl = this.bajaForm.get('fechaRetorno');
      if (tipo === 'Temporal') {
        fechaRetornoControl?.setValidators([Validators.required]);
      } else {
        fechaRetornoControl?.clearValidators();
      }
      fechaRetornoControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.cargarEmpleado();
    this.verificarPermisos();
  }
  
  
  ngAfterViewInit(): void {
    // Inicializar modales con aserción non-null
    this.modalBaja = new Modal(document.getElementById('modalBaja')!);
    this.modalReingreso = new Modal(document.getElementById('modalReingreso')!);
  }

  verificarPermisos(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isOwnProfile = currentUser.empleado === this.empleadoId;
      this.canEdit = currentUser.rol === 'recursosHumanos' || 
                     currentUser.rol === 'admin' || 
                     this.isOwnProfile;
    }
  }

  cargarEmpleado(): void {
    this.cargando = true;
    
    this.empleadoService.getEmpleadoPorId(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.empleado = response.data;
          this.cargarCursos();
          this.cargarActividades();
        } else {
          this.error = 'No se pudo cargar la información del empleado';
          this.cargando = false;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar la información del empleado';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarCursos(): void {
    this.empleadoService.getCursos(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success && this.empleado) {
          // Aseguramos que el empleado tenga la propiedad cursos inicializada
          if (!this.empleado.cursos) {
            this.empleado.cursos = [];
          }
          this.empleado.cursos = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar los cursos:', err);
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  cargarActividades(): void {
    this.empleadoService.getActividades(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success && this.empleado) {
          // Aseguramos que el empleado tenga la propiedad actividades inicializada
          if (!this.empleado.actividades) {
            this.empleado.actividades = [];
          }
          this.empleado.actividades = response.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar las actividades:', err);
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  cambiarParticipacion(actividad: any): void {
    // Cambia el estado de participación
    const nuevoEstado = !actividad.participo;
    
    // Llama al servicio para actualizar
    this.empleadoService.actualizarActividad(
      this.empleadoId, 
      actividad._id, 
      { participo: nuevoEstado }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          // Actualiza localmente el estado
          actividad.participo = nuevoEstado;
        }
      },
      error: (err) => {
        console.error('Error al actualizar participación:', err);
        this.error = 'Error al actualizar la participación';
      }
    });
  }

  eliminarEmpleado(): void {
    if (!confirm('¿Está seguro que desea eliminar este empleado? Esta acción no se puede deshacer.')) {
      return;
    }

    this.cargando = true;
    this.empleadoService.eliminarEmpleado(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/empleados']);
        } else {
          this.error = 'No se pudo eliminar el empleado';
          this.cargando = false;
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar el empleado';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  // Métodos para las bajas
  registrarBaja(): void {
  // Resetear formulario
  this.bajaForm.reset({
    tipo: 'Temporal',
    fecha: this.getFechaActual()
  });
  
  // Verificar si el modal existe antes de intentar mostrarlo
  if (this.modalBaja) {
    this.modalBaja.show();
  } else {
    console.error('Modal de baja no inicializado');
    // Fallback: inicializar el modal aquí si no existe
    const modalElement = document.getElementById('modalBaja');
    if (modalElement) {
      this.modalBaja = new Modal(modalElement);
      this.modalBaja.show();
    }
  }
}
  
  guardarBaja(): void {
    if (this.bajaForm.invalid) return;
    
    this.procesando = true;
    this.error = '';
    this.exito = '';
    
    const bajaData = {
      tipo: this.bajaForm.value.tipo,
      fecha: new Date(this.bajaForm.value.fecha),
      motivo: this.bajaForm.value.motivo,
      fechaRetorno: this.bajaForm.value.fechaRetorno ? new Date(this.bajaForm.value.fechaRetorno) : undefined
    };
    
    this.empleadoService.cambiarEstado(this.empleadoId, bajaData).subscribe({
      next: (response) => {
        if (response.success) {
          this.exito = 'Baja registrada correctamente';
          this.empleado = response.data;
          this.modalBaja.hide();
          setTimeout(() => {
            this.exito = '';
          }, 3000);
        } else {
          this.error = 'No se pudo registrar la baja';
        }
        this.procesando = false;
      },
      error: (err) => {
        this.error = 'Error al registrar la baja: ' + (err.error?.message || 'Error desconocido');
        this.procesando = false;
        console.error(err);
      }
    });
  }
  
  // Métodos para los reingresos
  registrarReingreso(): void {
    // Resetear formulario
    this.reingresoForm.reset({
      fecha: this.getFechaActual()
    });
    
    // Verificar si el modal existe antes de intentar mostrarlo
    if (this.modalReingreso) {
      this.modalReingreso.show();
    } else {
      console.error('Modal de reingreso no inicializado');
      // Fallback: inicializar el modal aquí si no existe
      const modalElement = document.getElementById('modalReingreso');
      if (modalElement) {
        this.modalReingreso = new Modal(modalElement);
        this.modalReingreso.show();
      }
    }
  }
  
  guardarReingreso(): void {
    if (this.reingresoForm.invalid) return;
    
    this.procesando = true;
    this.error = '';
    this.exito = '';
    
    const reingresoData = {
      tipo: 'Reingreso',
      fecha: new Date(this.reingresoForm.value.fecha),
      motivo: this.reingresoForm.value.motivo
    };
    
    this.empleadoService.cambiarEstado(this.empleadoId, reingresoData).subscribe({
      next: (response) => {
        if (response.success) {
          this.exito = 'Reingreso registrado correctamente';
          this.empleado = response.data;
          this.modalReingreso.hide();
          setTimeout(() => {
            this.exito = '';
          }, 3000);
        } else {
          this.error = 'No se pudo registrar el reingreso';
        }
        this.procesando = false;
      },
      error: (err) => {
        this.error = 'Error al registrar el reingreso: ' + (err.error?.message || 'Error desconocido');
        this.procesando = false;
        console.error(err);
      }
    });
  }
  
  // Método auxiliar para obtener la fecha actual formateada
  getFechaActual(): string {
    const fecha = new Date();
    return fecha.toISOString().split('T')[0];
  }
}