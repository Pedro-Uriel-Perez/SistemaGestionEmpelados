import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';
import { CatalogoService } from '../../services/catalogo.service';
import { Empleado } from '../../interfaces/empleado.interface';

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
  exito = '';
  fotoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  
  // Catálogos
  departamentos: any[] = [];
  puestos: string[] = [];
  ciudades = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla'];
  roles = ['empleado', 'recursosHumanos'];
  
  // Datos originales del empleado para comparar cambios
  empleadoOriginal: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private empleadoService: EmpleadoService,
    private catalogoService: CatalogoService
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarCatalogos();
    this.cargarEmpleado();
  }

  cargarCatalogos(): void {
    // Cargar departamentos desde el servicio
    this.catalogoService.getDepartamentos().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Departamentos cargados:', response.data);
          this.departamentos = response.data;
        }
      },
      error: (err) => console.error('Error al cargar departamentos:', err)
    });
  }

  cargarPuestosPorDepartamento(departamentoId: string): void {
    if (!departamentoId) {
      this.puestos = [];
      return;
    }
    
    this.catalogoService.getPuestosPorDepartamento(departamentoId).subscribe({
      next: (response) => {
        if (response.success) {
          // Ahora los puestos son un array de strings
          this.puestos = response.data;
          console.log('Puestos cargados:', this.puestos);
        }
      },
      error: (err) => console.error('Error al cargar puestos:', err)
    });
  }

  crearFormulario(): void {
    this.empleadoForm = this.fb.group({
      // Datos personales
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: ['', Validators.minLength(2)],
      fechaNacimiento: ['', Validators.required],
      sexo: ['', Validators.required],
      
      // Datos de contacto
      direccion: ['', Validators.required], // Calle
      numeroExterior: [''],
      numeroInterior: [''],
      colonia: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      ciudad: ['', Validators.required],
      
      // Teléfonos (como FormArray)
      telefonos: this.fb.array([]),
      telefono: [''], // Campo de respaldo para compatibilidad
      
      email: ['', [Validators.required, Validators.email]],
      
      // Referencias familiares
      referenciasFamiliares: this.fb.array([]),
      
      // Datos laborales
      fechaIngreso: ['', Validators.required],
      puesto: ['', Validators.required],
      departamento: ['', Validators.required],
      
      // Datos de usuario
      rol: ['empleado']
    });
    
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
  asignarRolSegunDepartamento(departamentoId: string): void {
    // Buscar el departamento seleccionado
    const departamento = this.departamentos.find(d => d._id === departamentoId);
    
    // Asignar rol automáticamente según el departamento
    if (departamento && departamento.esRecursosHumanos) {
      console.log('Asignando rol de recursosHumanos porque el departamento es RH');
      this.empleadoForm.get('rol')?.setValue('recursosHumanos');
    } else {
      console.log('Asignando rol de empleado porque el departamento NO es RH');
      this.empleadoForm.get('rol')?.setValue('empleado');
    }
  }

  // Métodos para manipular FormArrays
  get telefonosArray() {
    return this.empleadoForm.get('telefonos') as FormArray;
  }

  agregarTelefono(numero: string = '') {
    this.telefonosArray.push(this.fb.control(numero, Validators.required));
  }

  eliminarTelefono(index: number) {
    if (this.telefonosArray.length > 1) {
      this.telefonosArray.removeAt(index);
    }
  }

  get referenciasFamiliaresArray() {
    return this.empleadoForm.get('referenciasFamiliares') as FormArray;
  }

  agregarReferencia(referencia: { nombre?: string, parentesco?: string, telefono?: string, email?: string, _id?: string } = {}) {
    // Crear el FormGroup con valores por defecto
    const referenciaFormGroup = this.fb.group({
      nombre: [referencia.nombre || '', Validators.required],
      parentesco: [referencia.parentesco || '', Validators.required],
      telefono: [referencia.telefono || '', Validators.required],
      email: [referencia.email || '', Validators.email]
    });
    // Añadir el FormGroup al FormArray
    this.referenciasFamiliaresArray.push(referenciaFormGroup);
  }

  eliminarReferencia(index: number) {
    this.referenciasFamiliaresArray.removeAt(index);
  }

  cargarEmpleado(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    
    this.empleadoService.getEmpleadoPorId(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const empleado = response.data;
          this.empleadoOriginal = { ...empleado };
          
          try {
            // Extraer los componentes de la dirección
            const direccionCompleta = empleado.direccion || '';
            let direccion = '', numeroExterior = '', numeroInterior = '', colonia = '', codigoPostal = '';
            
            // Intentar parsear la dirección si está en el formato esperado
            if (direccionCompleta.includes(',')) {
              const partes = direccionCompleta.split(',').map(part => part.trim());
              direccion = partes[0] || '';
              
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
              // Si no está en el formato esperado, usar la dirección completa
              direccion = direccionCompleta;
            }
            
            // Formatear fechas para el input date
            const fechaNacimiento = empleado.fechaNacimiento ? this.formatearFecha(new Date(empleado.fechaNacimiento)) : '';
            const fechaIngreso = empleado.fechaIngreso ? this.formatearFecha(new Date(empleado.fechaIngreso)) : '';
            
            // Actualizar formulario con datos del empleado
            this.empleadoForm.patchValue({
              nombre: empleado.nombre,
              apellidoPaterno: empleado.apellidoPaterno,
              apellidoMaterno: empleado.apellidoMaterno,
              fechaNacimiento: fechaNacimiento,
              sexo: empleado.sexo || 'Masculino', 
              
              direccion: direccion,
              numeroExterior: numeroExterior,
              numeroInterior: numeroInterior,
              colonia: colonia,
              codigoPostal: codigoPostal,
              ciudad: empleado.ciudad,
              
              email: empleado.email,
              fechaIngreso: fechaIngreso,
              
              // No asignar departamento y puesto aquí
              rol: empleado.rol || 'empleado'
            });
            
            // Cargar teléfonos si existen
            if (empleado.telefonos && empleado.telefonos.length > 0) {
              // Limpiar el array existente
              while (this.telefonosArray.length) {
                this.telefonosArray.removeAt(0);
              }
              
              // Añadir cada teléfono
              empleado.telefonos.forEach((tel: any) => {
                if (typeof tel === 'object' && tel.numero) {
                  this.agregarTelefono(tel.numero);
                } else if (typeof tel === 'string') {
                  this.agregarTelefono(tel);
                }
              });
            } else if (empleado.telefono) {
              // Si no hay teléfonos en formato nuevo pero existe el campo antiguo
              this.agregarTelefono(empleado.telefono);
            } else {
              // Si no hay teléfonos, agregar uno vacío
              this.agregarTelefono();
            }
            
            // Cargar referencias familiares si existen
            if (empleado.referenciasFamiliares && empleado.referenciasFamiliares.length > 0) {
              // Limpiar el array existente
              while (this.referenciasFamiliaresArray.length) {
                this.referenciasFamiliaresArray.removeAt(0);
              }
              
              // Añadir cada referencia
              empleado.referenciasFamiliares.forEach((ref: any) => {
                this.agregarReferencia(ref);
              });
            }
            
            // Mostrar foto actual si existe
            if (empleado.foto) {
              const baseUrl = 'http://localhost:3000/';
              this.fotoPreview = empleado.foto.startsWith('http') 
                ? empleado.foto 
                : `${baseUrl}${empleado.foto}`;
            }
            
            // Una vez cargados los datos, buscar el departamento por nombre
            if (empleado.departamento) {
              // Cuando los departamentos se hayan cargado
              const buscarDepartamento = setInterval(() => {
                if (this.departamentos.length > 0) {
                  clearInterval(buscarDepartamento);
                  
                  // Buscar por nombreDepartamento
                  const departamentoEncontrado = this.departamentos.find(
                    d => d.nombreDepartamento === empleado.departamento
                  );
                  
                  if (departamentoEncontrado) {
                    // Asignar ID del departamento al formulario
                    this.empleadoForm.get('departamento')?.setValue(departamentoEncontrado._id);
                    
                    // Cargar los puestos de este departamento
                    this.cargarPuestosPorDepartamento(departamentoEncontrado._id);
                    
                    // Asignar el puesto después de que se carguen
                    setTimeout(() => {
                      this.empleadoForm.get('puesto')?.setValue(empleado.puesto);
                    }, 800);
                  }
                }
              }, 300);
            }
          } catch (error) {
            console.error('Error al procesar los datos del empleado:', error);
          }
          
          this.cargandoDatos = false;
        } else {
          this.error = 'No se pudo cargar la información del empleado';
          this.cargandoDatos = false;
        }
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
    if (!fecha || isNaN(fecha.getTime())) return '';
    
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
      this.marcarTodosComoTocados();
      return;
    }

    this.cargando = true;
    this.error = '';

    // Crear FormData para enviar datos y archivo
    const formData = new FormData();
    
    // Preparar los datos para enviarlos
    const empleadoData = this.prepararDatosEmpleado();
    
    // Agregar todos los campos del formulario
    Object.entries(empleadoData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
          // Para arreglos y objetos, convertir a JSON string
          formData.append(key, JSON.stringify(value));
        } else if (value !== null) {
          formData.append(key, String(value));
        }
      }
    });
    // Agregar foto si se seleccionó
    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }

    this.empleadoService.actualizarEmpleado(this.empleadoId, formData).subscribe({
      next: (response) => {
        this.cargando = false;
        this.exito = 'Empleado actualizado exitosamente';
        
        // Redirigir después de unos segundos
        setTimeout(() => {
          this.router.navigate(['/empleados']);
        }, 2000);
      },
      error: (err) => {
        this.error = 'Error al actualizar el empleado';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  // Marcar todos los campos como tocados para mostrar errores
  marcarTodosComoTocados() {
    Object.keys(this.empleadoForm.controls).forEach(campo => {
      const control = this.empleadoForm.get(campo);
      if (control instanceof FormArray) {
        const formArray = control as FormArray;
        formArray.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            Object.keys(ctrl.controls).forEach(subCampo => {
              ctrl.get(subCampo)?.markAsTouched();
            });
          } else {
            ctrl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  prepararDatosEmpleado(): Record<string, any> {
    const formValues = this.empleadoForm.value;
    
    // Formatear teléfonos como objetos
    const telefonos = formValues.telefonos.map((telefono: string) => ({
      numero: telefono,
      tipo: 'Personal'
    }));
    
    // Construir dirección completa
    const direccionCompleta = `${formValues.direccion}, ${formValues.numeroExterior || 'S/N'}${formValues.numeroInterior ? ' Int. ' + formValues.numeroInterior : ''}, ${formValues.colonia}, ${formValues.codigoPostal}, ${formValues.ciudad}`;
    
    // Encontrar el nombre del departamento seleccionado
    const departamentoSeleccionado = this.departamentos.find(d => d._id === formValues.departamento);
    const nombreDepartamento = departamentoSeleccionado ? departamentoSeleccionado.nombreDepartamento : '';
    
    // Crear objeto con los datos formateados
    return {
      nombre: formValues.nombre,
      apellidoPaterno: formValues.apellidoPaterno,
      apellidoMaterno: formValues.apellidoMaterno,
      fechaNacimiento: formValues.fechaNacimiento,
      sexo: formValues.sexo,
      direccion: direccionCompleta,
      ciudad: formValues.ciudad,
      email: formValues.email,
      telefonos: telefonos,
      referenciasFamiliares: formValues.referenciasFamiliares,
      fechaIngreso: formValues.fechaIngreso,
      departamento: nombreDepartamento,
      puesto: formValues.puesto,
      rol: formValues.rol
    };
  }

  volverALista(): void {
    this.router.navigate(['/empleados']);
  }

  // Getters para validaciones de campos
  get nombreNoValido() {
    return this.empleadoForm.get('nombre')?.invalid && this.empleadoForm.get('nombre')?.touched;
  }

  get apellidoPaternoNoValido() {
    return this.empleadoForm.get('apellidoPaterno')?.invalid && this.empleadoForm.get('apellidoPaterno')?.touched;
  }

  get fechaNacimientoNoValido() {
    return this.empleadoForm.get('fechaNacimiento')?.invalid && this.empleadoForm.get('fechaNacimiento')?.touched;
  }

  get sexoNoValido() {
    return this.empleadoForm.get('sexo')?.invalid && this.empleadoForm.get('sexo')?.touched;
  }

  get direccionNoValida() {
    return this.empleadoForm.get('direccion')?.invalid && this.empleadoForm.get('direccion')?.touched;
  }

  get coloniaNoValida() {
    return this.empleadoForm.get('colonia')?.invalid && this.empleadoForm.get('colonia')?.touched;
  }

  get codigoPostalNoValido() {
    return this.empleadoForm.get('codigoPostal')?.invalid && this.empleadoForm.get('codigoPostal')?.touched;
  }

  get ciudadNoValida() {
    return this.empleadoForm.get('ciudad')?.invalid && this.empleadoForm.get('ciudad')?.touched;
  }

  get emailNoValido() {
    return this.empleadoForm.get('email')?.invalid && this.empleadoForm.get('email')?.touched;
  }

  get fechaIngresoNoValida() {
    return this.empleadoForm.get('fechaIngreso')?.invalid && this.empleadoForm.get('fechaIngreso')?.touched;
  }

  get puestoNoValido() {
    return this.empleadoForm.get('puesto')?.invalid && this.empleadoForm.get('puesto')?.touched;
  }

  get departamentoNoValido() {
    return this.empleadoForm.get('departamento')?.invalid && this.empleadoForm.get('departamento')?.touched;
  }
}