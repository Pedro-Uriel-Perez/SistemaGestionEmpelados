import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private apiUrl = 'http://localhost:3000/api/departamentos';


  constructor(private http: HttpClient) { }

  // Obtener todos los departamentos
  getDepartamentos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  // Obtener un departamento por ID
  getDepartamento(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  // Obtener puestos de un departamento
  getPuestosPorDepartamento(departamentoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${departamentoId}/puestos`);
  }
  // Obtener todos los puestos
  getTodosLosPuestos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/puestos/todos`);
  }
}