import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Product } from '../../models/producto.model';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { enviorment } from '../../../envioroments/envioroments';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() canBuy = true;
  @Output() add = new EventEmitter<Product>();
  detallesAbiertos = false;

  private carritoService = inject(CarritoService);

  get imageSrc(): string {
    const imageUrl = this.product?.imageUrl || '';
    const apiBase = enviorment.apiUrl.replace(/\/api\/?$/, '');
    if (!imageUrl) return '/logo.png';
    if (imageUrl.startsWith('/uploads/')) return `${apiBase}${imageUrl}`;
    if (imageUrl.startsWith('uploads/')) return `${apiBase}/${imageUrl}`;
    if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) return imageUrl;
    return `/${imageUrl}`;
  }

  get stockDisponible(): number {
    return this.product.stock - this.carritoService.cantidadEnCarrito(this.product.id);
  }

  onAdd() {
    if (!this.canBuy) return;
    if (this.stockDisponible <= 0) return;
    this.add.emit(this.product);
  }

  abrirDetalles() {
    this.detallesAbiertos = true;
  }

  cerrarDetalles() {
    this.detallesAbiertos = false;
  }
}
