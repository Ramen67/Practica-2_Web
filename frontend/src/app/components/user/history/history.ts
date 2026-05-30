import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';

interface CompraView {
  id: number;
  elementos_comprados: string;
  total: number;
  fecha?: string;
  productos: Array<{
    name?: string;
    nombre?: string;
    cantidad?: number;
    price?: number;
    precio?: number;
  }>;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  compras: CompraView[] = [];
  cargando = true;
  error = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef, // 👈
  ) {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.error = '';

    this.userService.getOrderHistory().subscribe({
      next: (respuestas: any[]) => {
        this.compras = (respuestas || []).map((compra) => {
          let productos: CompraView['productos'] = [];

          try {
            const elementos = compra.elementos_comprados;
            productos = Array.isArray(elementos) ? elementos : JSON.parse(elementos || '[]');
          } catch {
            productos = [];
          }

          return {
            ...compra,
            productos,
          };
        });
        this.cargando = false;
        this.cdr.detectChanges(); // 👈
      },
      error: () => {
        this.error = 'No se pudo cargar tu historial de compras';
        this.cargando = false;
        this.cdr.detectChanges(); // 👈
      },
    });
  }

  tieneCompras(): boolean {
    return this.compras.length > 0;
  }
}
