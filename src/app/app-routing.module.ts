import { NgModule, inject } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ListaEmpleadosComponent } from './components/lista-empleados/lista-empleados.component';
import { CrearEmpleadoComponent } from './components/crear-empleado/crear-empleado.component';
import { EditarEmpleadoComponent } from './components/editar-empleado/editar-empleado.component';
import { VerEmpleadoComponent } from './components/ver-empleado/ver-empleado.component';
import { PerfilEmpleadoComponent } from './components/perfil-empleado/perfil-empleado.component';
import { AuthService } from './services/auth.service';
import { Component } from '@angular/core';
import { ListaCursosComponent } from './components/cursos/lista-cursos/lista-cursos.component';
import { EditarCursoComponent } from './components/cursos/editar-curso/editar-curso.component';
import { ListaActividadesComponent } from './components/actividades/lista-actividades/lista-actividades.component';
import { EditarActividadComponent } from './components/actividades/editar-actividad/editar-actividad.component';

// Componente vacío para usar en la ruta de redirección
@Component({
  template: ''
})
export class EmptyComponent {}

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // Ruta específica para el perfil de empleado (solo rol "empleado")
  { path: 'perfil', component: PerfilEmpleadoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['empleado'] }},
  
  // Rutas para RH)
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'recursosHumanos'] },
    children: [
      { path: '', redirectTo: 'empleados', pathMatch: 'full' },
      
      // Nueva ruta para el catálogo de actividades
      { path: 'actividades', component: ListaActividadesComponent },
      
      // Rutas de empleados
      { path: 'empleados', component: ListaEmpleadosComponent },
      { path: 'empleados/crear', component: CrearEmpleadoComponent },
      { path: 'empleados/editar/:id', component: EditarEmpleadoComponent },
      { path: 'empleados/ver/:id', component: VerEmpleadoComponent },
      
      //  rutas para cursos
      { path: 'empleados/:id/cursos', component: ListaCursosComponent },
      { path: 'empleados/:id/cursos/nuevo', component: EditarCursoComponent },
      { path: 'empleados/:id/cursos/editar/:cursoId', component: EditarCursoComponent },
      
      //  rutas para actividades
      { path: 'empleados/:id/actividades', component: ListaActividadesComponent },
      { path: 'empleados/:id/actividades/nuevo', component: EditarActividadComponent },
      { path: 'empleados/:id/actividades/editar/:actividadId', component: EditarActividadComponent }
    ]
  },
  
  // Redireccion basada en rol
  { 
    path: '**',
    component: EmptyComponent,
    resolve: {
      redirect: () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        
        if (!authService.isLoggedIn()) {
          router.navigate(['/login']);
          return;
        }
        
        const userRole = authService.getUserRole();
        
        if (userRole === 'empleado') {
          router.navigate(['/perfil']);
        } else {
          router.navigate(['/empleados']);
        }
        
        return true; // Resolver debe retornar un valor
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: [EmptyComponent]
})
export class AppRoutingModule { }