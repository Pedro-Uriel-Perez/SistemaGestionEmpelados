import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ListaEmpleadosComponent } from './components/lista-empleados/lista-empleados.component';
import { CrearEmpleadoComponent } from './components/crear-empleado/crear-empleado.component';
import { EditarEmpleadoComponent } from './components/editar-empleado/editar-empleado.component';
import { VerEmpleadoComponent } from './components/ver-empleado/ver-empleado.component';
import { PerfilEmpleadoComponent } from './components/perfil-empleado/perfil-empleado.component';
import { ListaCursosComponent } from './components/cursos/lista-cursos/lista-cursos.component';
import { EditarCursoComponent } from './components/cursos/editar-curso/editar-curso.component';
import { ListaActividadesComponent } from './components/actividades/lista-actividades/lista-actividades.component';
import { EditarActividadComponent } from './components/actividades/editar-actividad/editar-actividad.component';

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
    ListaCursosComponent,
    EditarCursoComponent,
    ListaActividadesComponent,
    EditarActividadComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }