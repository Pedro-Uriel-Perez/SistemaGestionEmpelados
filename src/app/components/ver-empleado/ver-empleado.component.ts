import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../services/empleado.service';
import { AuthService } from '../../services/auth.service';
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
  canEdit: boolean = false;
  isOwnProfile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.cargarEmpleado();
    this.verificarPermisos();
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

  registrarBaja(): void {
    // Esta funcionalidad se implementará en otro componente o modal
    this.router.navigate(['/empleados', this.empleadoId, 'baja']);
  }

  registrarReingreso(): void {
    // Esta funcionalidad se implementará en otro componente o modal
    this.router.navigate(['/empleados', this.empleadoId, 'reingreso']);
  }
}