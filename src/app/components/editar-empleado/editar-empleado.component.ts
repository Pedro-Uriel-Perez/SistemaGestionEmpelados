// components/empleados/editar-empleado/editar-empleado.component.ts
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
  puestos: any[] = [];
  ciudades: any[] = [];
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
    // Si tienes endpoints para cargar los catálogos desde la BD, descomenta estas líneas
    // y comenta las asignaciones directas de abajo
    
    /*
    // Cargar departamentos
    this.catalogoService.getDepartamentos().subscribe({
      next: (response) => {
        if (response.success) {
          this.departamentos = response.data;
        }
      },
      error: (err) => console.error('Error al cargar departamentos:', err)
    });

    // Cargar puestos
    this.catalogoService.getPuestos().subscribe({
      next: (response) => {
        if (response.success) {
          this.puestos = response.data;
        }
      },
      error: (err) => console.error('Error al cargar puestos:', err)
    });

    // Cargar ciudades
    this.catalogoService.getCiudades().subscribe({
      next: (response) => {
        if (response.success) {
          this.ciudades = response.data;
        }
      },
      error: (err) => console.error('Error al cargar ciudades:', err)
    });
    */
    
    // Asignación directa como respaldo
    this.departamentos = ['Ventas', 'Recursos Humanos', 'Administración', 'TI'];
    this.puestos = ['Gerente', 'Supervisor', 'Analista', 'Asistente'];
    this.ciudades = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla'];
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
          console.log('Datos del empleado cargados:', empleado);
          
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
              // Si no existe la propiedad sexo en empleado, usar valor por defecto
              sexo: empleado.sexo || 'Masculino', 
              
              direccion: direccion,
              numeroExterior: numeroExterior,
              numeroInterior: numeroInterior,
              colonia: colonia,
              codigoPostal: codigoPostal,
              ciudad: empleado.ciudad,
              
              email: empleado.email,
              fechaIngreso: fechaIngreso,
              puesto: empleado.puesto,
              departamento: empleado.departamento,
              
              // Si no existe la propiedad rol en empleado, usar valor por defecto
              rol: 'empleado' 
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
          } catch (error) {
            console.error('Error al procesar los datos del empleado:', error);
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
    Object.keys(empleadoData).forEach(key => {
      if (typeof empleadoData[key] === 'object') {
        // Para arreglos y objetos, convertir a JSON string
        formData.append(key, JSON.stringify(empleadoData[key]));
      } else {
        formData.append(key, empleadoData[key]);
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

  prepararDatosEmpleado() {
    const formValues = this.empleadoForm.value;
    
    // Formatear teléfonos como objetos
    const telefonos = formValues.telefonos.map((telefono: string) => ({
      numero: telefono,
      tipo: 'Personal'
    }));
    
    // Construir dirección completa
    const direccionCompleta = `${formValues.direccion}, ${formValues.numeroExterior || 'S/N'}${formValues.numeroInterior ? ' Int. ' + formValues.numeroInterior : ''}, ${formValues.colonia}, ${formValues.codigoPostal}, ${formValues.ciudad}`;
    
    // Crear objeto con los datos formateados
    return {
      ...formValues,
      direccion: direccionCompleta,
      telefonos: telefonos
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