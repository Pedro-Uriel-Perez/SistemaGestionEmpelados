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

// Componente vacío para usar en la ruta de redirección
@Component({
  template: ''
})
export class EmptyComponent {}

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // Ruta específica para el perfil de empleado (solo rol "empleado")
  { 
    path: 'perfil', 
    component: PerfilEmpleadoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['empleado'] }
  },
  
  // Rutas para administración (solo admin y RH)
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'recursosHumanos'] },
    children: [
      { path: '', redirectTo: 'empleados', pathMatch: 'full' },
      { path: 'empleados', component: ListaEmpleadosComponent },
      { path: 'empleados/crear', component: CrearEmpleadoComponent },
      { path: 'empleados/editar/:id', component: EditarEmpleadoComponent },
      { path: 'empleados/ver/:id', component: VerEmpleadoComponent },
    ]
  },
  
  // Redirección inteligente basada en rol
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