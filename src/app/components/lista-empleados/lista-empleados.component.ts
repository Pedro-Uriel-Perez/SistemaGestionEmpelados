import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from '../../services/empleado.service';
import { CatalogoService } from '../../services/catalogo.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-lista-empleados',
  templateUrl: './lista-empleados.component.html',
  styleUrls: ['./lista-empleados.component.css']
})
export class ListaEmpleadosComponent implements OnInit {
  empleados: any[] = [];
  cargando = false;
  error = '';
  
  // Catálogos
  departamentos: any[] = [];
  puestos: string[] = [];
  
  // Estados disponibles para el filtro
  estados: string[] = ['Activo', 'BajaTemporal', 'BajaDefinitiva'];
  
  // Formulario para los filtros
  filtrosForm: FormGroup;
  
  // Para controlar qué puestos mostrar
  departamentoSeleccionado: string = '';

  constructor(
    private empleadoService: EmpleadoService,
    private catalogoService: CatalogoService,
    private fb: FormBuilder
  ) {
    // Inicializar el formulario
    this.filtrosForm = this.fb.group({
      nombre: [''],
      departamento: [''],
      puesto: [''],
      estado: [''],
      clave: ['']
    });
  }

  ngOnInit(): void {
    // Cargar departamentos al inicio
    this.cargarDepartamentos();
    
    // Cargar empleados iniciales
    this.cargarEmpleados();
    
    // Suscribirse a cambios en el formulario con debounce
    this.filtrosForm.valueChanges
      .pipe(debounceTime(500)) // Esperar 500ms después del último cambio
      .subscribe(() => {
        this.cargarEmpleados();
      });
    
    // Suscribirse a cambios en el campo de departamento para actualizar los puestos
    this.filtrosForm.get('departamento')?.valueChanges.subscribe(departamento => {
      if (departamento) {
        this.departamentoSeleccionado = departamento;
        this.actualizarPuestos(departamento);
      } else {
        this.puestos = [];
        this.filtrosForm.get('puesto')?.setValue('');
      }
    });
  }

  cargarDepartamentos(): void {
    this.catalogoService.getDepartamentos().subscribe({
      next: (response) => {
        this.departamentos = response.data || [];
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
      }
    });
  }
  
  actualizarPuestos(departamentoNombre: string): void {
    // Buscar el departamento seleccionado
    const departamento = this.departamentos.find(d => d.nombreDepartamento === departamentoNombre);
    
    if (departamento) {
      // Si encontramos el departamento, usamos sus puestos
      this.puestos = departamento.puestos || [];
    } else {
      this.puestos = [];
    }
    
    // Reiniciar el puesto seleccionado si no está en la nueva lista
    const puestoActual = this.filtrosForm.get('puesto')?.value;
    if (puestoActual && !this.puestos.includes(puestoActual)) {
      this.filtrosForm.get('puesto')?.setValue('');
    }
  }

  eliminarEmpleado(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.')) {
      this.empleadoService.eliminarEmpleado(id).subscribe({
        next: () => {
          this.cargarEmpleados(); // Recarga la lista después de eliminar
        },
        error: (err) => {
          this.error = 'Error al eliminar el empleado';
          console.error(err);
        }
      });
    }
  }
  
  cargarEmpleados(): void {
    this.cargando = true;
    this.error = '';

    // Obtener valores del formulario y filtrar valores vacíos
    const filtros = this.filtrosForm.value;
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) {
        delete filtros[key];
      }
    });

    this.empleadoService.getEmpleados(filtros).subscribe({
      next: (resp) => {
        this.empleados = resp.data || [];
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los empleados';
        this.cargando = false;
        console.error(err);
      }
    });
  }
  
  limpiarFiltros(): void {
    this.filtrosForm.reset({
      nombre: '',
      departamento: '',
      puesto: '',
      estado: '',
    });
    this.departamentoSeleccionado = '';
    this.puestos = [];
  }
}