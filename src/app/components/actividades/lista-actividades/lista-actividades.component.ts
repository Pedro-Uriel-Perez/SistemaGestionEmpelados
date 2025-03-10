import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmpleadoService } from '../../../services/empleado.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-lista-actividades',
  templateUrl: './lista-actividades.component.html',
  styleUrls: ['./lista-actividades.component.css']
})
export class ListaActividadesComponent implements OnInit {
  empleadoId: string = '';
  actividades: any[] = [];
  empleado: any = null;
  loading: boolean = true;
  error: string = '';
  canEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private empleadoService: EmpleadoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.loadEmpleadoInfo();
    this.loadActividades();
    
    // Solo RH puede editar actividades
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.canEdit = currentUser.rol === 'recursosHumanos' || currentUser.rol === 'admin';
    }
  }

  loadEmpleadoInfo(): void {
    this.empleadoService.getEmpleadoPorId(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.empleado = response.data;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar información del empleado';
        console.error(err);
      }
    });
  }

  loadActividades(): void {
    this.loading = true;
    this.empleadoService.getActividades(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.actividades = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las actividades';
        this.loading = false;
        console.error(err);
      }
    });
  }

  eliminarActividad(actividadId: string): void {
    if (confirm('¿Está seguro de eliminar esta actividad?')) {
      this.empleadoService.eliminarActividad(this.empleadoId, actividadId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadActividades(); // Recargar la lista
          }
        },
        error: (err) => {
          this.error = 'Error al eliminar la actividad';
          console.error(err);
        }
      });
    }
  }
}
