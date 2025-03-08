import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Redireccionar al dashboard si ya está autenticado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    
    // Guardar url de retorno para redirección post-login
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  
  onSubmit(): void {
    // Detener si el formulario es inválido
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(
      this.loginForm.get('username')?.value,
      this.loginForm.get('password')?.value
    )
    .subscribe({
      next: (data) => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Usuario o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}