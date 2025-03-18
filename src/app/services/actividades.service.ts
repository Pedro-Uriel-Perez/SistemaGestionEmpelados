import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  private apiUrl = 'http://localhost:3000/api/actividades';


  constructor(private http: HttpClient) { }

  // Obtener todas las actividades
  getTodasActividades(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }
  // Crear una nueva actividad (solo RH)
  crearActividad(actividadData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, actividadData);
  }
  // Obtener una actividad específica
  getActividad(actividadId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${actividadId}`);
  }
  // Eliminar una actividad
  eliminarActividad(actividadId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${actividadId}`);
  }
  // Asignar actividad a un empleado
asignarActividad(empleadoId: string, actividadData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asignar/${empleadoId}`, actividadData);
  }
}