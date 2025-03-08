// guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    
    const userRole = this.authService.getUserRole();
    
    if (!requiredRoles.includes(userRole)) {
      // Redireccionar según el rol actual
      if (userRole === 'empleado') {
        this.router.navigate(['/perfil']);
      } else {
        this.router.navigate(['/']);
      }
      return false;
    }
    
    return true;
  }
}