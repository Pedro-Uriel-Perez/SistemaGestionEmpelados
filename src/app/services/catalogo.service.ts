// services/catalogo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private apiUrl = 'http://localhost:3000/api/catalogos';

  constructor(private http: HttpClient) { }

  // Obtener todos los departamentos
  getDepartamentos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/departamentos`);
  }

  // Obtener todos los puestos
  getPuestos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/puestos`);
  }

  // Obtener todas las ciudades
  getCiudades(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ciudades`);
  }


  // Obtener un departamento por ID
  getDepartamentoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/departamentos/${id}`);
  }

  // Obtener un puesto por ID
  getPuestoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/puestos/${id}`);
  }

  // Obtener una ciudad por ID
  getCiudadById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ciudades/${id}`);
  }
}