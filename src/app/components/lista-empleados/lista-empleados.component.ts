import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from '../../services/empleado.service';

@Component({
  selector: 'app-lista-empleados',
  templateUrl: './lista-empleados.component.html',
  styleUrls: ['./lista-empleados.component.css']
})
export class ListaEmpleadosComponent implements OnInit {
  empleados: any[] = [];
  cargando = false;
  error = '';

  constructor(private empleadoService: EmpleadoService) { }

  ngOnInit(): void {
    this.cargarEmpleados();
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

    this.empleadoService.getEmpleados().subscribe({
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

  
}