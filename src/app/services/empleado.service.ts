// services/empleado.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado } from '../interfaces/empleado.interface';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private apiUrl = 'http://localhost:3000/api/empleados';

  constructor(private http: HttpClient) { }
  
  getEmpleados(filtros?: any): Observable<{success: boolean, count: number, data: Empleado[]}> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          params = params.append(key, filtros[key]);
        }
      });
    }
    
    return this.http.get<{success: boolean, count: number, data: Empleado[]}>(this.apiUrl, { params });
  }
  
  getMiPerfil(): Observable<{success: boolean, data: Empleado}> {
    return this.http.get<{success: boolean, data: Empleado}>(`${this.apiUrl}/perfil`);
  }
  
  getEmpleadoPorId(id: string): Observable<{success: boolean, data: Empleado}> {
    return this.http.get<{success: boolean, data: Empleado}>(`${this.apiUrl}/${id}`);
  }
  
  crearEmpleado(empleado: FormData): Observable<{success: boolean, data: Empleado}> {
    return this.http.post<{success: boolean, data: Empleado}>(this.apiUrl, empleado);
  }
  
  actualizarEmpleado(id: string, empleado: FormData): Observable<{success: boolean, data: Empleado}> {
    return this.http.put<{success: boolean, data: Empleado}>(`${this.apiUrl}/${id}`, empleado);
  }
  
  cambiarEstado(id: string, data: {tipo: string, fecha: Date, motivo: string, fechaRetorno?: Date}): Observable<{success: boolean, data: Empleado}> {
    return this.http.patch<{success: boolean, data: Empleado}>(`${this.apiUrl}/${id}/estado`, data);
  }
  
  eliminarEmpleado(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  
  // Métodos para cursos
  getCursos(empleadoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${empleadoId}/cursos`);
  }

  getCurso(empleadoId: string, cursoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${empleadoId}/cursos/${cursoId}`);
  }

  registrarCurso(empleadoId: string, cursoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${empleadoId}/cursos`, cursoData);
  }

  actualizarCurso(empleadoId: string, cursoId: string, cursoData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${empleadoId}/cursos/${cursoId}`, cursoData);
  }

  eliminarCurso(empleadoId: string, cursoId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${empleadoId}/cursos/${cursoId}`);
  }
  
  // Métodos para actividades
  getActividades(empleadoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${empleadoId}/actividades`);
  }

  getActividad(empleadoId: string, actividadId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${empleadoId}/actividades/${actividadId}`);
  }

  registrarActividad(empleadoId: string, actividadData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${empleadoId}/actividades`, actividadData);
  }

  actualizarActividad(empleadoId: string, actividadId: string, actividadData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${empleadoId}/actividades/${actividadId}`, actividadData);
  }

  eliminarActividad(empleadoId: string, actividadId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${empleadoId}/actividades/${actividadId}`);
  }
}