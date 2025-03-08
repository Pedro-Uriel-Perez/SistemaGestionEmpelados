// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }
  
login(username: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
    .pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('userRole', res.user.rol);
        
        // Redirigir según el rol
        if (res.user.rol === 'empleado') {
          this.router.navigate(['/perfil']);
        } else {
          this.router.navigate(['/empleados']);
        }
      })
    );
}

crearUsuario(datos: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/users`, datos);
}
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  // Nuevo método para obtener el rol del usuario
  getUserRole(): string {
    // Primero intentamos obtener el rol del localStorage directamente
    const roleFromStorage = localStorage.getItem('userRole');
    if (roleFromStorage) {
      return roleFromStorage;
    }
    
    // Si no está en localStorage, intentamos obtenerlo del objeto user
    const user = this.getCurrentUser();
    return user ? user.rol : 'empleado'; // Por defecto, consideramos al usuario como empleado
  }
  
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}