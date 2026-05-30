import { Component, computed, signal } from '@angular/core';
import { Product } from '../../models/producto.model';
import { ProductsService } from '../../services/producto.service';
import { ProductCardComponent } from '../product-card/product-card';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],
})
export class CatalogoComponent {
  products = signal<Product[]>([]);
  busqueda = signal('');
  categoriaSeleccionada = signal('todas');
  disponibilidadSeleccionada = signal('todos');
  ordenSeleccionado = signal('nombre-asc');
  mensaje = signal('');
  mostrarMensaje = signal(false);
  toasts = signal<{ id: number; texto: string }[]>([]);
  toastId = 0;

  categorias = computed(() => {
    const categorias = this.products()
      .map((product) => product.category)
      .filter((category): category is string => Boolean(category));

    return [...new Set(categorias)].sort((a, b) => a.localeCompare(b));
  });

  productosFiltrados = computed(() => {
    const busqueda = this.busqueda().trim().toLowerCase();
    const categoria = this.categoriaSeleccionada();
    const disponibilidad = this.disponibilidadSeleccionada();
    const orden = this.ordenSeleccionado();

    return this.products()
      .filter((product) => {
        const coincideTexto =
          !busqueda ||
          product.name.toLowerCase().includes(busqueda) ||
          product.description.toLowerCase().includes(busqueda) ||
          product.category.toLowerCase().includes(busqueda);

        const coincideCategoria = categoria === 'todas' || product.category === categoria;
        const coincideDisponibilidad =
          disponibilidad === 'todos' ||
          (disponibilidad === 'disponibles' && product.stock > 0) ||
          (disponibilidad === 'agotados' && product.stock <= 0);

        return coincideTexto && coincideCategoria && coincideDisponibilidad;
      })
      .sort((a, b) => {
        if (orden === 'precio-asc') return a.price - b.price;
        if (orden === 'precio-desc') return b.price - a.price;
        if (orden === 'stock-desc') return b.stock - a.stock;
        return a.name.localeCompare(b.name);
      });
  });

  constructor(
    private productsService: ProductsService,
    private carritoService: CarritoService,
    private authService: AuthService,
  ) {
    this.productsService.getAll().subscribe({
      next: (data) => this.products.set(data),
      error: (err) => console.error('Error cargando de la base de datos:', err),
    });
  }

  puedeComprar(): boolean {
    return this.authService.getUsuario()?.rol !== 'admin';
  }

  actualizarBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  actualizarCategoria(event: Event): void {
    this.categoriaSeleccionada.set((event.target as HTMLSelectElement).value);
  }

  actualizarDisponibilidad(event: Event): void {
    this.disponibilidadSeleccionada.set((event.target as HTMLSelectElement).value);
  }

  actualizarOrden(event: Event): void {
    this.ordenSeleccionado.set((event.target as HTMLSelectElement).value);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.categoriaSeleccionada.set('todas');
    this.disponibilidadSeleccionada.set('todos');
    this.ordenSeleccionado.set('nombre-asc');
  }

  agregar(producto: Product) {
    if (!this.puedeComprar()) {
      return;
    }

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
