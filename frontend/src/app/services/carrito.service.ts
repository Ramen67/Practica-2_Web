import { Injectable, signal } from '@angular/core';
import { Product } from '../models/producto.model';
import { CartItem } from '../models/carrito-item.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private itemsSignal = signal<CartItem[]>([]);
  items = this.itemsSignal.asReadonly();

  agregar(producto: Product) {
    this.itemsSignal.update((lista) => {
      // Buscar si el producto ya existe en el carrito
      const existente = lista.find((item) => item.id === producto.id);

      if (existente) {
        if (existente.cantidad >= existente.stock) {
          return lista;
        }

        // Si existe, aumentar cantidad
        return lista.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        );
      } else {
        if (producto.stock <= 0) {
          return lista;
        }

        // Si no existe, agregarlo con cantidad 1
        return [...lista, { ...producto, cantidad: 1 }];
      }
    });
  }

  aumentarCantidad(id: number) {
    this.itemsSignal.update((lista) =>
      lista.map((item) =>
        item.id === id && item.cantidad < item.stock
          ? { ...item, cantidad: item.cantidad + 1 }
          : item,
      ),
    );
  }

  disminuirCantidad(id: number) {
    this.itemsSignal.update((lista) =>
      lista
        .map((item) =>
          item.id === id && item.cantidad > 1 ? { ...item, cantidad: item.cantidad - 1 } : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  }

  cantidadEnCarrito(id: number): number {
    const item = this.itemsSignal().find((p) => p.id === id);
    return item ? item.cantidad : 0;
  }

  stockDisponible(id: number): number {
    const item = this.itemsSignal().find((p) => p.id === id);
    if (!item) {
      return 0;
    }
    return Math.max(item.stock - item.cantidad, 0);
  }

  puedeAumentar(id: number): boolean {
    const item = this.itemsSignal().find((p) => p.id === id);
    return item ? item.cantidad < item.stock : false;
  }

  quitar(id: number) {
    this.itemsSignal.update((lista) => lista.filter((item) => item.id !== id));
  }

  vaciar() {
    this.itemsSignal.set([]);
  }

  total(): number {
    return this.itemsSignal().reduce((acc, item) => acc + item.price * item.cantidad, 0);
  }

  exportarXML() {
    const items = this.itemsSignal();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

    for (const item of items) {
      xml += `  <producto>\n`;
      xml += `    <id>${item.id}</id>\n`;
      xml += `    <nombre>${this.escapeXml(item.name)}</nombre>\n`;
      xml += `    <precio>${item.price}</precio>\n`;
      xml += `    <cantidad>${item.cantidad}</cantidad>\n`;
      xml += `    <subtotal>${item.price * item.cantidad}</subtotal>\n`;
      if (item.description) {
        xml += `    <descripcion>${this.escapeXml(item.description)}</descripcion>\n`;
      }
      xml += `  </producto>\n`;
    }

    xml += `  <total>${this.total()}</total>\n`;
    xml += `</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    a.click();

    URL.revokeObjectURL(url);
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }
}
