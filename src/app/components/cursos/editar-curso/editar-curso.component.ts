import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../../services/empleado.service';

@Component({
  selector: 'app-editar-curso',
  templateUrl: './editar-curso.component.html',
  styleUrls: ['./editar-curso.component.css']
})
export class EditarCursoComponent implements OnInit {
  cursoForm!: FormGroup;
  empleadoId: string = '';
  cursoId: string = '';
  isEditing: boolean = false;
  loading: boolean = false;
  error: string = '';
  tiposDocumento: string[] = ['Constancia', 'Diploma', 'Certificado', 'Reconocimiento', 'Otro'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empleadoService: EmpleadoService
  ) { }

  ngOnInit(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.cursoId = this.route.snapshot.params['cursoId'];
    this.isEditing = !!this.cursoId;
    
    this.createForm();
    
    if (this.isEditing && this.cursoId) {
      this.loadCursoData();
    }
  }

  createForm(): void {
    this.cursoForm = this.fb.group({
      nombre: ['', [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      tipoDocumento: ['', [Validators.required]],
      observaciones: ['']
    });
  }

  loadCursoData(): void {
    this.loading = true;
    this.empleadoService.getCurso(this.empleadoId, this.cursoId).subscribe({
      next: (response) => {
        if (response.success) {
          const curso = response.data;
          this.cursoForm.patchValue({
            nombre: curso.nombre,
            fechaInicio: this.formatDate(curso.fechaInicio),
            fechaFin: this.formatDate(curso.fechaFin),
            tipoDocumento: curso.tipoDocumento,
            observaciones: curso.observaciones || ''
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar información del curso';
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
    if (this.cursoForm.invalid) {
      return;
    }

    this.loading = true;
    const cursoData = this.cursoForm.value;

    const request = this.isEditing
      ? this.empleadoService.actualizarCurso(this.empleadoId, this.cursoId, cursoData)
      : this.empleadoService.registrarCurso(this.empleadoId, cursoData);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/empleados', this.empleadoId, 'cursos']);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al ${this.isEditing ? 'actualizar' : 'crear'} el curso`;
        this.loading = false;
        console.error(err);
      }
    });
  }
}