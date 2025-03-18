import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActividadService } from '../../../services/actividades.service'; 
import { EmpleadoService } from '../../../services/empleado.service';

@Component({
  selector: 'app-editar-actividad',
  templateUrl: './editar-actividad.component.html',
  styleUrls: ['./editar-actividad.component.css']
})
export class EditarActividadComponent implements OnInit {
  empleadoId: string = '';
  actividades: any[] = [];
  actividadSeleccionada: any = null;
  cargando: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actividadService: ActividadService,
    private empleadoService: EmpleadoService
  ) { }

  ngOnInit(): void {
    this.empleadoId = this.route.snapshot.params['id'];
    this.cargarCatalogoActividades();
  }

  cargarCatalogoActividades(): void {
    this.cargando = true;
    this.actividadService.getTodasActividades().subscribe({
      next: (response) => {
        if (response.success) {
          // Cargar actividades ya asignadas para filtrarlas
          this.empleadoService.getActividades(this.empleadoId).subscribe({
            next: (empResponse) => {
              if (empResponse.success) {
                const actividadesAsignadas = empResponse.data || [];
                // Filtrar actividades no asignadas
                this.actividades = response.data.filter((act: any) =>
                  !actividadesAsignadas.some((asig: any) =>
                    asig.nombre === act.nombre
                  )
                );
              }
              this.cargando = false;
            },
            error: (err) => {
              this.error = 'Error al cargar actividades del empleado';
              this.cargando = false;
              console.error(err);
            }
          });
        } else {
          this.error = 'Error al cargar el catálogo de actividades';
          this.cargando = false;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar el catálogo de actividades';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  asignarActividad(): void {
    if (!this.actividadSeleccionada) {
      this.error = 'Debe seleccionar una actividad';
      return;
    }

    const datos = {
      actividadId: this.actividadSeleccionada._id
    };

    this.actividadService.asignarActividad(this.empleadoId, datos).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/empleados/ver', this.empleadoId]);
        } else {
          this.error = 'Error al asignar la actividad';
        }
      },
      error: (err) => {
        this.error = 'Error al asignar la actividad';
        console.error(err);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/empleados/ver', this.empleadoId]);
  }
}