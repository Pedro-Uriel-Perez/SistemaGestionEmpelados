// components/empleados/ver-empleado/ver-empleado.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../interfaces/empleado.interface';

@Component({
  selector: 'app-ver-empleado',
  templateUrl: './ver-empleado.component.html',
  styleUrls: ['./ver-empleado.component.css']
})
export class VerEmpleadoComponent implements OnInit {
  empleado: Empleado | null = null;
  empleadoId: string = '';
  cargando: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService
  ) { }

  ngOnInit(): void {
    this.cargarEmpleado();
  }

  cargarEmpleado(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.cargando = true;
    
    this.empleadoService.getEmpleadoPorId(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.empleado = response.data;
        } else {
          this.error = 'No se pudo cargar la información del empleado';
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la información del empleado';
        this.cargando = false;
        console.error(err);
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
}