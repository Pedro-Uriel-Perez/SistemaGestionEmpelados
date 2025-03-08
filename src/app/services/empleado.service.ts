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
  
  registrarCurso(id: string, curso: any): Observable<{success: boolean, data: Empleado}> {
    return this.http.post<{success: boolean, data: Empleado}>(`${this.apiUrl}/${id}/cursos`, curso);
  }
  
  registrarActividad(id: string, actividad: any): Observable<{success: boolean, data: Empleado}> {
    return this.http.post<{success: boolean, data: Empleado}>(`${this.apiUrl}/${id}/actividades`, actividad);
  }
  
  eliminarEmpleado(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}