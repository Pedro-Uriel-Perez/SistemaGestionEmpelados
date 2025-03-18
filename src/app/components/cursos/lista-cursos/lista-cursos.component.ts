import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmpleadoService } from '../../../services/empleado.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-lista-cursos',
  templateUrl: './lista-cursos.component.html',
  styleUrls: ['./lista-cursos.component.css']
})
export class ListaCursosComponent implements OnInit {
  empleadoId: string = '';
  cursos: any[] = [];
  empleado: any = null;
  loading: boolean = true;
  error: string = '';
  isOwnProfile: boolean = false;
  canEdit: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private empleadoService: EmpleadoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.loadEmpleadoInfo();
    this.loadCursos();
    
    // Verificar permisos
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.isOwnProfile = currentUser.empleado === this.empleadoId;
      this.canEdit = currentUser.rol === 'recursosHumanos' || currentUser.rol === 'admin' || this.isOwnProfile;
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

  loadCursos(): void {
    this.loading = true;
    this.empleadoService.getCursos(this.empleadoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.cursos = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los cursos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  eliminarCurso(cursoId: string): void {
    if (confirm('¿Está seguro de eliminar este curso?')) {
      this.empleadoService.eliminarCurso(this.empleadoId, cursoId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCursos();
          }
        },
        error: (err) => {
          this.error = 'Error al eliminar el curso';
          console.error(err);
        }
      });
    }
  }
}
