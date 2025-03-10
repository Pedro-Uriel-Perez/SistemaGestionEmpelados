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
          if (res && res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            localStorage.setItem('userRole', res.user.rol);
            localStorage.setItem('lastAuth', new Date().getTime().toString());
            
            // Redirigir según el rol
            if (res.user.rol === 'empleado') {
              this.router.navigate(['/perfil']);
            } else {
              this.router.navigate(['/empleados']);
            }
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
    localStorage.removeItem('lastAuth');
    
    // Usar window.location.href para forzar un refresh completo
    window.location.href = '/login';
  }
  
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const lastAuth = localStorage.getItem('lastAuth');
    
    if (!token || !lastAuth) {
      return false;
    }
    
    // Verificar si han pasado más de 24 horas desde la última autenticación
    const now = new Date().getTime();
    const lastAuthTime = parseInt(lastAuth, 10);
    const hoursDiff = (now - lastAuthTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Si han pasado más de 24 horas, cerrar sesión automáticamente
      this.logout();
      return false;
    }
    
    return true;
  }
  
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    if (!user) {
      return null;
    }
    
    try {
      return JSON.parse(user);
    } catch (e) {
      console.error('Error al parsear el usuario:', e);
      this.logout();
      return null;
    }
  }
  
  // Método para obtener el rol del usuario
  getUserRole(): string {
    // Primero intentamos obtener el rol del localStorage directamente
    const roleFromStorage = localStorage.getItem('userRole');
    if (roleFromStorage) {
      return roleFromStorage;
    }
    
    // Si no está en localStorage, intentamos obtenerlo del objeto user
    const user = this.getCurrentUser();
    return user ? user.rol : '';
  }
  
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Nuevo método para actualizar el timestamp de última autenticación
  refreshAuthTimestamp(): void {
    localStorage.setItem('lastAuth', new Date().getTime().toString());
  }
}