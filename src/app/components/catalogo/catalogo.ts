import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '../../models/producto.model';
import { ProductsService } from '../../services/producto.service';
import { ProductCardComponent } from '../product-card/product-card';
import { Carrito } from '../carrito/carrito';
import { CarritoService } from '../../services/carrito.service';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent, Navbar],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
})
export class CatalogoComponent {
  products = signal<Product[]>([]);
  inStockCount = computed(() => this.products().filter((p) => p.inStock).length);
  mensaje = signal('');
  mostrarMensaje = signal(false);
  toasts = signal<{ id: number; texto: string }[]>([]);
  toastId = 0;
  constructor(
    private productsService: ProductsService,
    private carritoService: CarritoService,
  ) {
    this.productsService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Error cargando XML:', err),
    });
  }
  agregar(producto: Product) {
    this.carritoService.agregar(producto);

    const id = this.toastId++;

    this.toasts.update((lista) => [
      ...lista,
      { id, texto: `${producto.name} ha sido agregado con exito al carrito` },
    ]);

    setTimeout(() => {
      this.toasts.update((lista) => lista.filter((t) => t.id !== id));
    }, 2000);
  }
}
