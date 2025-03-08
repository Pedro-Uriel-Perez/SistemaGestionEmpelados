// components/perfil-empleado/perfil-empleado.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../interfaces/empleado.interface';

@Component({
  selector: 'app-perfil-empleado',
  templateUrl: './perfil-empleado.component.html',
  styleUrls: ['./perfil-empleado.component.css']
})
export class PerfilEmpleadoComponent implements OnInit {
  empleado: Empleado | null = null;
  cargando = true;
  error = '';

  constructor(
    private authService: AuthService,
    private empleadoService: EmpleadoService
  ) { }

  cerrarSesion(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const user = this.authService.getCurrentUser();
    
    if (user && user.empleado) {
      this.empleadoService.getEmpleadoPorId(user.empleado).subscribe({
        next: (response) => {
          if (response.success) {
            this.empleado = response.data;
          } else {
            this.error = 'No se pudo cargar su información';
          }
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al cargar su información';
          this.cargando = false;
        }
      });
    } else {
      this.error = 'No se encontró información de empleado asociada a su usuario';
      this.cargando = false;
    }
  }
}