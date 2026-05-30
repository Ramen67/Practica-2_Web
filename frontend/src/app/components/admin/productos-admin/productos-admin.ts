import { Component, ChangeDetectorRef, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventarioService } from '../../../services/inventario.service';
import { AuthService } from '../../../services/auth.service';

interface ProductoView {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imageUrl: string;
  category: string;
  detalles: string;
  inStock: boolean;
}

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-admin.html',
  styleUrl: './productos-admin.css',
})
export class AdminProductos implements OnInit {
  private platformId = inject(PLATFORM_ID);
  cargando = true;
  guardandoId: number | null = null;
  imagenesPendientes = new Map<number, File>();
  nombresImagenesPendientes = new Map<number, string>();
  toasts: { id: number; texto: string }[] = [];
  toastId = 0;

  productos: ProductoView[] = [];

  nuevoProducto: Omit<ProductoView, 'id'> = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imageUrl: '',
    category: '',
    detalles: '',
    inStock: true,
  };

  constructor(
    private inventarioService: InventarioService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const usuario = this.authService.getUsuario();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    if (usuario.rol !== 'admin') {
      this.router.navigate(['/catalogo']);
      return;
    }

    this.cargarProductos();
  }

  trackById(index: number, producto: ProductoView): number {
    return producto.id;
  }

  private toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
    return false;
  }

  private normalizarProducto(raw: any): ProductoView {
    return {
      id: Number(raw?.id ?? 0),
      nombre: raw?.nombre ?? raw?.name ?? '',
      descripcion: raw?.descripcion ?? raw?.description ?? '',
      precio: Number(raw?.precio ?? raw?.price ?? 0),
      stock: Number(raw?.stock ?? 0),
      imageUrl: raw?.imageUrl ?? raw?.imagen ?? '',
      category: raw?.category ?? raw?.categoria ?? '',
      detalles: raw?.detalles ?? raw?.details ?? '',
      inStock: this.toBoolean(raw?.inStock ?? raw?.instock ?? raw?.in_stock),
    };
  }

  cargarProductos(): void {
    this.cargando = true;

    this.inventarioService.obtenerProductos().subscribe({
      next: (productos: ProductoView[]) => {
        this.productos = (productos || []).map((producto) => this.normalizarProducto(producto));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.agregarToast('No se pudo cargar el inventario');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  crearProducto(): void {
    this.inventarioService
      .crearProducto({
        ...this.nuevoProducto,
        precio: Number(this.nuevoProducto.precio),
        stock: Number(this.nuevoProducto.stock),
      })
      .subscribe({
        next: (response) => {
          const productoNormalizado = response?.producto
            ? this.normalizarProducto(response.producto)
            : null;

          if (productoNormalizado) {
            this.productos = [productoNormalizado, ...this.productos];
          } else {
            this.cargarProductos(); // fallback solo si no viene el producto
          }

          this.agregarToast('Producto creado');
          this.nuevoProducto = {
            nombre: '',
            descripcion: '',
            precio: 0,
            stock: 0,
            imageUrl: '',
            category: '',
            detalles: '',
            inStock: true,
          };
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.agregarToast(error?.error?.error || 'No se pudo crear el producto');
          this.cdr.detectChanges();
        },
      });
  }

  guardarProducto(producto: ProductoView): void {
    this.guardandoId = producto.id;
    const imagenPendiente = this.imagenesPendientes.get(producto.id);

    const actualizarConImagen = (imageUrl: string) => {
      this.inventarioService.actualizarProducto(producto.id, {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        stock: Number(producto.stock),
        imageUrl,
        category: producto.category,
        detalles: producto.detalles,
        inStock: producto.inStock,
      })
      .subscribe({
        next: () => {
          producto.imageUrl = imageUrl;
          this.imagenesPendientes.delete(producto.id);
          this.nombresImagenesPendientes.delete(producto.id);
          this.guardandoId = null;
          this.agregarToast('Producto actualizado');
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.guardandoId = null;
          this.agregarToast(error?.error?.error || 'No se pudo actualizar el producto');
          this.cdr.detectChanges();
        },
      });
    };

    if (imagenPendiente) {
      this.inventarioService.subirImagen(imagenPendiente).subscribe({
        next: (response) => {
          const imageUrl =
            response.imageUrl || (response.filename ? `/uploads/${response.filename}` : '');
          actualizarConImagen(imageUrl);
        },
        error: (error) => {
          this.guardandoId = null;
          this.agregarToast(error?.error?.error || 'No se pudo subir la imagen');
          this.cdr.detectChanges();
        },
      });
      return;
    }

    actualizarConImagen(producto.imageUrl);
  }

  eliminarProducto(producto: ProductoView): void {
    if (!confirm(`Desactivar ${producto.nombre}?`)) {
      return;
    }

    this.inventarioService.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.productos = this.productos.filter((item) => item.id !== producto.id);
        this.agregarToast('Producto desactivado');
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.agregarToast(error?.error?.error || 'No se pudo desactivar el producto');
        this.cdr.detectChanges();
      },
    });
  }

  subirImagen(event: Event, producto: ProductoView | null): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];

    if (producto) {
      this.imagenesPendientes.set(producto.id, archivo);
      this.nombresImagenesPendientes.set(producto.id, archivo.name);
      this.agregarToast('Imagen lista para guardar');
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.inventarioService.subirImagen(archivo).subscribe({
      next: (response) => {
        const imageUrl =
          response.imageUrl || (response.filename ? `/uploads/${response.filename}` : '');
        this.nuevoProducto.imageUrl = imageUrl;
        this.agregarToast('Imagen subida');
        input.value = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.agregarToast(error?.error?.error || 'No se pudo subir la imagen');
        input.value = '';
        this.cdr.detectChanges();
      },
    });
  }

  nombreImagenPendiente(producto: ProductoView): string | null {
    return this.nombresImagenesPendientes.get(producto.id) ?? null;
  }

  private agregarToast(texto: string): void {
    const id = this.toastId++;
    this.toasts = [...this.toasts, { id, texto }];
    setTimeout(() => {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
      this.cdr.detectChanges();
    }, 2000);
  }
}
