import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// Importa tus otros componentes...

import { TokenInterceptor } from './interceptors/token.interceptor';
import { ListaEmpleadosComponent } from './components/lista-empleados/lista-empleados.component';
import { CrearEmpleadoComponent } from './components/crear-empleado/crear-empleado.component';
import { EditarEmpleadoComponent } from './components/editar-empleado/editar-empleado.component';
import { VerEmpleadoComponent } from './components/ver-empleado/ver-empleado.component';
import { PerfilEmpleadoComponent } from './components/perfil-empleado/perfil-empleado.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ListaEmpleadosComponent,
    CrearEmpleadoComponent,
    EditarEmpleadoComponent,
    VerEmpleadoComponent,
    PerfilEmpleadoComponent,
    SidebarComponent,
    // Agrega los demás componentes aquí
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule   // ¡Esta es la importación clave!
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }