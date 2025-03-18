import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { EmpleadoService } from '../../services/empleado.service';
import { HttpClient } from '@angular/common/http';
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
    private fb: FormBuilder,
    private http: HttpClient 
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
    
    // Extraer componentes de la dirección
    const direccionCompleta = this.empleado.direccion || '';
    let calle = '', numeroExterior = '', numeroInterior = '', colonia = '', codigoPostal = '';
    
    // Intentar parsear la dirección si está en el formato esperado
    if (direccionCompleta.includes(',')) {
      const partes = direccionCompleta.split(',').map(part => part.trim());
      calle = partes[0] || '';
      
      // Extraer número exterior e interior
      if (partes.length > 1) {
        const numeroParte = partes[1];
        if (numeroParte.includes('Int.')) {
          const numPartes = numeroParte.split('Int.');
          numeroExterior = numPartes[0].replace('S/N', '').trim();
          numeroInterior = numPartes[1].trim();
        } else {
          numeroExterior = numeroParte.replace('S/N', '').trim();
        }
      }
      
      // Extraer colonia y código postal
      if (partes.length > 2) {
        colonia = partes[2] || '';
      }
      
      if (partes.length > 3) {
        codigoPostal = partes[3] || '';
      }
    } else {
      // Si no está en el formato esperado, usar la dirección completa como calle
      calle = direccionCompleta;
    }
    
    this.formularioEdicion = this.fb.group({
      // Datos de dirección separados
      calle: [calle, Validators.required],
      numeroExterior: [numeroExterior],
      numeroInterior: [numeroInterior],
      colonia: [colonia, Validators.required],
      codigoPostal: [codigoPostal, Validators.required],
      
      // Otros campos
      ciudad: [this.empleado.ciudad, Validators.required],
      email: [this.empleado.email, [Validators.required, Validators.email]],
      
      // Teléfonos y referencias familiares
      telefonos: this.fb.array([]),
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
      // Marcar todos los campos como tocados
      Object.keys(this.formularioEdicion.controls).forEach(key => {
        const control = this.formularioEdicion.get(key);
        if (control instanceof FormArray) {
          const formArray = control as FormArray;
          formArray.controls.forEach(ctrl => {
            if (ctrl instanceof FormGroup) {
              Object.keys(ctrl.controls).forEach(subKey => {
                ctrl.get(subKey)?.markAsTouched();
              });
            } else {
              ctrl.markAsTouched();
            }
          });
        } else {
          control?.markAsTouched();
        }
      });
      return;
    }
  
    this.guardando = true;
    this.error = '';
    this.exito = '';
  
    // Construir dirección completa
    const calle = this.formularioEdicion.get('calle')?.value || '';
    const numeroExterior = this.formularioEdicion.get('numeroExterior')?.value || 'S/N';
    const numeroInterior = this.formularioEdicion.get('numeroInterior')?.value;
    const colonia = this.formularioEdicion.get('colonia')?.value || '';
    const codigoPostal = this.formularioEdicion.get('codigoPostal')?.value || '';
    
    const direccionCompleta = `${calle}, ${numeroExterior}${numeroInterior ? ' Int. ' + numeroInterior : ''}, ${colonia}, ${codigoPostal}`;
    
    // Crear un objeto FormData para el envío de datos
    const formData = new FormData();
    
    // Agregar campos
    formData.append('direccion', direccionCompleta);
    formData.append('ciudad', this.formularioEdicion.get('ciudad')?.value);
    formData.append('email', this.formularioEdicion.get('email')?.value);
    formData.append('telefonos', JSON.stringify(this.telefonosArray.value));
    formData.append('referenciasFamiliares', JSON.stringify(this.referenciasFamiliaresArray.value));
  
    // Enviar actualización
    this.empleadoService.actualizarEmpleado(this.empleadoId, formData).subscribe({
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
        console.error('Error completo:', err);
        this.error = `Error al actualizar: ${err.error?.message || err.statusText || 'Error de conexión'}`;
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
  
  get calleNoValida() {
    return this.formularioEdicion.get('calle')?.invalid && this.formularioEdicion.get('calle')?.touched;
  }
  
  get coloniaNoValida() {
    return this.formularioEdicion.get('colonia')?.invalid && this.formularioEdicion.get('colonia')?.touched;
  }
  
  get codigoPostalNoValido() {
    return this.formularioEdicion.get('codigoPostal')?.invalid && this.formularioEdicion.get('codigoPostal')?.touched;
  }
  
  get ciudadNoValida() {
    return this.formularioEdicion.get('ciudad')?.invalid && this.formularioEdicion.get('ciudad')?.touched;
  }
}