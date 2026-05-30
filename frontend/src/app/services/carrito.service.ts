import { Injectable, signal } from '@angular/core';
import { Product } from '../models/producto.model';
import { CartItem } from '../models/carrito-item.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly ivaRate = 0.16;
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

  subtotal(): number {
    return this.itemsSignal().reduce((acc, item) => acc + item.price * item.cantidad, 0);
  }

  iva(): number {
    return this.subtotal() * this.ivaRate;
  }

  total(): number {
    return this.subtotal() + this.iva();
  }

  exportarXML() {
    const items = this.itemsSignal(); 
    const subtotal = this.subtotal();
    const iva = this.iva();
    const totalConIva = this.total();

    // Generar folio único
    const folio = `TK-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;

    // Obtener fecha y hora actual
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-MX');
    const hora = ahora.toLocaleTimeString('es-MX');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <empresa>
    <nombre>ToolMarket S.A. de C.V.</nombre>
    <rfc>CTC240315AB1</rfc>
    <direccion>Av. Vallarta, Col. Americana, Guadalajara, Jalisco, México</direccion>
    <codigoPostal>44160</codigoPostal>
  </empresa>

  <encabezado>
    <folio>${folio}</folio>
    <fecha>${fecha}</fecha>
    <hora>${hora}</hora>
  </encabezado>

  <productos>
`;

    // Agregar productos
    for (const item of items) {
      const subtotalProducto = (item.price * item.cantidad).toFixed(2);
      xml += `    <producto>
      <nombre>${this.escapeXml(item.name)}</nombre>
      <cantidad>${item.cantidad}</cantidad>
      <precio>$${item.price.toFixed(2)}</precio>
      <subtotal>$${subtotalProducto}</subtotal>
    </producto>
`;
    }

    xml += `  </productos>

  <resumen>
    <subtotal>$${subtotal.toFixed(2)}</subtotal>
    <iva>$${iva.toFixed(2)}</iva>
    <total>$${totalConIva.toFixed(2)}</total>
  </resumen>

  <pago>
    <metodo>Tarjeta de crédito/débito</metodo>
    <formaSAT>28 - Tarjeta de débito</formaSAT>
  </pago>

  <facturacion>
    <rfc>OEME080412HGA</rfc>
    <nombre>Emiliano Ortega Monzón</nombre>
    <regimen>612 - Personas Físicas con Actividades Empresariales</regimen>
    <codigoPostalFiscal>44100</codigoPostalFiscal>
    <usoCFDI>G03 - Gastos en general</usoCFDI>
    <email>emiliano.ortega@example.com</email>
  </facturacion>

  <aviso>
    <mensaje>Conserve este ticket para cualquier aclaración o facturación.</mensaje>
  </aviso>
</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_${folio}.xml`;
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
