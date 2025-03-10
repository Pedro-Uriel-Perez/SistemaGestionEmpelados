import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../../services/empleado.service';

@Component({
  selector: 'app-editar-actividad',
  templateUrl: './editar-actividad.component.html',
  styleUrls: ['./editar-actividad.component.css']
})
export class EditarActividadComponent implements OnInit {
  actividadForm!: FormGroup;
  empleadoId: string = '';
  actividadId: string = '';
  isEditing: boolean = false;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService
  ) { }

  ngOnInit(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.actividadId = this.route.snapshot.params['actividadId'];
    this.isEditing = !!this.actividadId;
    
    this.createForm();
    
    if (this.isEditing && this.actividadId) {
      this.loadActividadData();
    }
  }

  createForm(): void {
    this.actividadForm = this.fb.group({
      nombre: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      participo: [true],
      observaciones: ['']
    });
  }

  loadActividadData(): void {
    this.loading = true;
    this.empleadoService.getActividad(this.empleadoId, this.actividadId).subscribe({
      next: (response) => {
        if (response.success) {
          const actividad = response.data;
          this.actividadForm.patchValue({
            nombre: actividad.nombre,
            fecha: this.formatDate(actividad.fecha),
            participo: actividad.participo,
            observaciones: actividad.observaciones || ''
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar información de la actividad';
        this.loading = false;
        console.error(err);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().substring(0, 10);
  }

  onSubmit(): void {
    if (this.actividadForm.invalid) {
      return;
    }

    this.loading = true;
    const actividadData = this.actividadForm.value;

    const request = this.isEditing
      ? this.empleadoService.actualizarActividad(this.empleadoId, this.actividadId, actividadData)
      : this.empleadoService.registrarActividad(this.empleadoId, actividadData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/empleados', this.empleadoId, 'actividades']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al ${this.isEditing ? 'actualizar' : 'crear'} la actividad`;
        this.loading = false;
        console.error(err);
      }
    });
  }
}
