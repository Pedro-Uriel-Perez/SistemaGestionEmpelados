// components/actividades/lista-actividades/lista-actividades.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActividadService } from '../../../services/actividades.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-lista-actividades',
  templateUrl: './lista-actividades.component.html',
  styleUrls: ['./lista-actividades.component.css']
})
export class ListaActividadesComponent implements OnInit {
  actividades: any[] = [];
  loading: boolean = true;
  error: string = '';
  esRecursosHumanos: boolean = false;
  mostrarFormulario: boolean = false;
  actividadForm: FormGroup;

  constructor(
    private actividadService: ActividadService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.actividadForm = this.fb.group({
      nombre: ['', Validators.required],
      fecha: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.cargarActividades();
  }

  checkUserRole(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.esRecursosHumanos = currentUser.rol === 'recursosHumanos';
    }
  }

  cargarActividades(): void {
    this.loading = true;
    this.actividadService.getTodasActividades().subscribe({
      next: (response) => {
        if (response.success) {
          this.actividades = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las actividades';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (this.mostrarFormulario) {
      this.actividadForm.reset();
    }
  }

  guardarActividad(): void {
    if (this.actividadForm.invalid) return;

    const actividad = this.actividadForm.value;
    this.actividadService.crearActividad(actividad).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarFormulario = false;
          this.cargarActividades();
        }
      },
      error: (err) => {
        this.error = 'Error al crear la actividad';
        console.error(err);
      }
    });
  }
}