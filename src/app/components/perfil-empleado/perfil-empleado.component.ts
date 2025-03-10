import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado, Telefono, ReferenciaFamiliar, Curso } from '../../interfaces/empleado.interface';

@Component({
  selector: 'app-perfil-empleado',
  templateUrl: './perfil-empleado.component.html',
  styleUrls: ['./perfil-empleado.component.css']
})
export class PerfilEmpleadoComponent implements OnInit, OnDestroy {
  empleado: Empleado | null = null;
  cargando = true;
  error = '';
  empleadoId = '';
  modoEdicion = false;
  guardando = false;
  exito = '';
  formularioEdicion!: FormGroup;
  mostrarFormCurso = false;
  formularioCurso!: FormGroup;
  
  private loadingTimeout: any;

  constructor(
    private authService: AuthService,
    private empleadoService: EmpleadoService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadingTimeout = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        this.error = 'Tiempo de espera agotado. Por favor, intente nuevamente.';
      }
    }, 15000);

    this.cargarPerfil();
    this.inicializarFormularioCurso();
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  forzarSalida(): void {
    localStorage.clear();
    window.location.href = '/login';
  }

  cargarPerfil(): void {
    const user = this.authService.getCurrentUser();
    
    if (!user?.empleado) {
      clearTimeout(this.loadingTimeout);
      this.error = 'No se encontró información de empleado asociada a su usuario';
      this.cargando = false;
      return;
    }
    
    this.empleadoId = user.empleado;
    this.empleadoService.getEmpleadoPorId(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.empleado = response.data;
          
          // Asegurar que los arrays existan
          this.empleado.telefonos ??= [];
          this.empleado.referenciasFamiliares ??= [];
          this.empleado.cursos ??= [];
          this.empleado.actividades ??= [];
          
          this.inicializarFormularioEdicion();
          this.cargarDatosAdicionales();
        } else {
          clearTimeout(this.loadingTimeout);
          this.error = 'No se pudo cargar su información';
          this.cargando = false;
        }
      },
      error: (err) => {
        clearTimeout(this.loadingTimeout);
        this.error = `Error al cargar su información: ${err.status ? err.status + ' - ' + err.statusText : 'Error de conexión'}`;
        this.cargando = false;
        
        if (err.status === 401 || err.status === 403) {
          setTimeout(() => this.forzarSalida(), 3000);
        }
      }
    });
  }

  cargarDatosAdicionales(): void {
    // Cargar cursos y actividades en paralelo
    const cursos$ = this.empleadoService.getCursos(this.empleadoId);
    const actividades$ = this.empleadoService.getActividades(this.empleadoId);
    
    // Subscribirse a cursos
    cursos$.subscribe({
      next: (response) => {
        if (response.success && this.empleado) {
          this.empleado.cursos = response.data;
        }
      },
      complete: () => this.verificarCargaCompleta()
    });
    
    // Subscribirse a actividades
    actividades$.subscribe({
      next: (response) => {
        if (response.success && this.empleado) {
          this.empleado.actividades = response.data;
        }
      },
      complete: () => this.verificarCargaCompleta()
    });
  }

  verificarCargaCompleta(): void {
    if (this.empleado) {
      clearTimeout(this.loadingTimeout);
      this.cargando = false;
    }
  }

  // Funcionalidad de edición
  inicializarFormularioEdicion(): void {
    if (!this.empleado) return;
    
    this.formularioEdicion = this.fb.group({
      // Datos personales que se pueden editar
      direccion: [this.empleado.direccion, Validators.required],
      ciudad: [this.empleado.ciudad, Validators.required],
      email: [this.empleado.email, [Validators.required, Validators.email]],
      
      // Teléfonos (como FormArray)
      telefonos: this.fb.array([]),
      
      // Referencias familiares (como FormArray)
      referenciasFamiliares: this.fb.array([])
    });
    
    // Cargar teléfonos existentes
    this.empleado.telefonos.forEach(tel => 
      this.telefonosArray.push(this.fb.group({
        numero: [tel.numero, Validators.required],
        tipo: [tel.tipo || 'Personal', Validators.required]
      }))
    );
    
    // Si no hay teléfonos, agregamos uno vacío
    if (this.telefonosArray.length === 0) {
      this.agregarTelefono();
    }
    
    // Cargar referencias familiares existentes
    this.empleado.referenciasFamiliares?.forEach(ref => 
      this.referenciasFamiliaresArray.push(this.fb.group({
        nombre: [ref.nombre, Validators.required],
        parentesco: [ref.parentesco, Validators.required],
        telefono: [ref.telefono, Validators.required],
        email: [ref.email || '', Validators.email]
      }))
    );
  }
  
  inicializarFormularioCurso(): void {
    this.formularioCurso = this.fb.group({
      nombre: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      tipoDocumento: [''],
      observaciones: ['']
    });
  }

  // Getters para los FormArrays
  get telefonosArray() {
    return this.formularioEdicion.get('telefonos') as FormArray;
  }

  get referenciasFamiliaresArray() {
    return this.formularioEdicion.get('referenciasFamiliares') as FormArray;
  }

  // Métodos para manipular FormArrays
  agregarTelefono(): void {
    this.telefonosArray.push(this.fb.group({
      numero: ['', Validators.required],
      tipo: ['Personal', Validators.required]
    }));
  }

  eliminarTelefono(index: number): void {
    if (this.telefonosArray.length > 1) {
      this.telefonosArray.removeAt(index);
    }
  }

  agregarReferencia(): void {
    this.referenciasFamiliaresArray.push(this.fb.group({
      nombre: ['', Validators.required],
      parentesco: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', Validators.email]
    }));
  }

  eliminarReferencia(index: number): void {
    this.referenciasFamiliaresArray.removeAt(index);
  }

  // Modos de edición
  activarModoEdicion(): void {
    this.modoEdicion = true;
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.inicializarFormularioEdicion(); // Restaurar datos originales
  }

  guardarCambios(): void {
    if (this.formularioEdicion.invalid) {
      Object.keys(this.formularioEdicion.controls).forEach(key => {
        const control = this.formularioEdicion.get(key);
        control?.markAsTouched();
        
        // Si es un FormArray, marcar todos sus controles
        if (control instanceof FormArray) {
          control.controls.forEach(c => {
            if (c instanceof FormGroup) {
              Object.keys(c.controls).forEach(k => c.get(k)?.markAsTouched());
            } else {
              c.markAsTouched();
            }
          });
        }
      });
      return;
    }

    this.guardando = true;
    this.error = '';
    this.exito = '';

    const datosActualizados = {
      ...this.formularioEdicion.value
    };

    this.empleadoService.actualizarEmpleado(this.empleadoId, datosActualizados).subscribe({
      next: (response) => {
        if (response.success) {
          this.empleado = response.data;
          this.exito = 'Información actualizada correctamente';
          this.modoEdicion = false;
        } else {
          this.error = 'No se pudo actualizar la información';
        }
        this.guardando = false;
      },
      error: (err) => {
        this.error = `Error al actualizar: ${err.error?.message || 'Error de conexión'}`;
        this.guardando = false;
      }
    });
  }

  // Gestión de cursos
  toggleFormularioCurso(): void {
    this.mostrarFormCurso = !this.mostrarFormCurso;
    if (this.mostrarFormCurso) {
      this.inicializarFormularioCurso();
    }
  }

  agregarCurso(): void {
    if (this.formularioCurso.invalid) {
      Object.keys(this.formularioCurso.controls).forEach(key => {
        this.formularioCurso.get(key)?.markAsTouched();
      });
      return;
    }

    this.guardando = true;
    const nuevoCurso = this.formularioCurso.value;

    this.empleadoService.registrarCurso(this.empleadoId, nuevoCurso).subscribe({
      next: (response) => {
        if (response.success && this.empleado) {
          // Actualizar la lista de cursos en el componente
          this.empleado.cursos = [...(this.empleado.cursos || []), response.data];
          this.exito = 'Curso registrado correctamente';
          this.mostrarFormCurso = false;
          this.inicializarFormularioCurso();
        } else {
          this.error = 'No se pudo registrar el curso';
        }
        this.guardando = false;
      },
      error: (err) => {
        this.error = `Error al registrar curso: ${err.error?.message || 'Error de conexión'}`;
        this.guardando = false;
      }
    });
  }

  // Getters para validaciones
  get emailNoValido() {
    return this.formularioEdicion.get('email')?.invalid && this.formularioEdicion.get('email')?.touched;
  }
  
  get direccionNoValida() {
    return this.formularioEdicion.get('direccion')?.invalid && this.formularioEdicion.get('direccion')?.touched;
  }
  
  get ciudadNoValida() {
    return this.formularioEdicion.get('ciudad')?.invalid && this.formularioEdicion.get('ciudad')?.touched;
  }
}