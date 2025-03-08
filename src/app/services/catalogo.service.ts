import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ciudad, Puesto, Departamento } from '../interfaces/catalogos.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private apiUrl = 'http://localhost:3000/api/catalogos';

  
  constructor(private http: HttpClient) { }
  
  getCiudades(): Observable<{success: boolean, data: Ciudad[]}> {
    return this.http.get<{success: boolean, data: Ciudad[]}>(`${this.apiUrl}/ciudades`);
  }
  
  getPuestos(): Observable<{success: boolean, data: Puesto[]}> {
    return this.http.get<{success: boolean, data: Puesto[]}>(`${this.apiUrl}/puestos`);
  }
  
  getDepartamentos(): Observable<{success: boolean, data: Departamento[]}> {
    return this.http.get<{success: boolean, data: Departamento[]}>(`${this.apiUrl}/departamentos`);
  }
}