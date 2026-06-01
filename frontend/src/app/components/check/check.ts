import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';
import { ComprasService } from '../../services/compras.service';

declare global {
  interface Window {
    paypal: any;
  }
}

@Component({
  selector: 'app-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './check.html',
  styleUrl: './check.css',
})
export class Check implements AfterViewInit {
  readonly avisoPrivacidadUrl = '/uploads/Avisos%20de%20privacidad.pdf';
  readonly terminosUrl = '/uploads/Terminos%20y%20Condiciones.pdf';

  private router = inject(Router);
  private carritoService = inject(CarritoService);
  private paypalService = inject(PaypalService);
  private comprasService = inject(ComprasService);

  @ViewChild('paypalButtonContainer') paypalButtonContainer?: ElementRef<HTMLDivElement>;

  carrito = computed(() => this.carritoService.items());
  subtotal = computed(() => this.carritoService.subtotal());
  iva = computed(() => this.carritoService.iva());
  total = computed(() => this.carritoService.total());

  loading = signal(false);
  error = signal<string | null>(null);
  orderId = signal<string | null>(null);
  paymentApproved = signal(false);
  private paypalButtonRendered = false;

  ngAfterViewInit() {
    if (this.orderId()) {
      this.renderPaypalButton();
    }
  }

  crearOrdenPayPal() {
    this.loading.set(true);
    this.error.set(null);

    const items = this.carrito().map((item) => ({
      nombre: item.name,
      cantidad: item.cantidad,
      precio: item.price,
    }));

    const payload = {
      items,
      subtotal: this.subtotal(),
      iva: this.iva(),
      total: this.total(),
    };

    this.paypalService.crearOrden(payload).subscribe({
      next: (response) => {
        this.orderId.set(response.id);
        this.loading.set(false);
        setTimeout(() => this.renderPaypalButton());
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al crear la orden: ' + err.message);
        console.error('Error creando orden:', err);
      },
    });
  }

  capturarOrden() {
    const id = this.orderId();
    if (!id) {
      this.error.set('No hay orden para capturar');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const items = this.carrito().map((item) => ({
      id: item.id,
      nombre: item.name,
      cantidad: item.cantidad,
      precio: item.price,
    }));

    const itemsHistorial = items.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
    }));

    this.paypalService.capturarOrden(id, items, this.total()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.paymentApproved.set(true);
        console.log('Pago capturado:', response);
        this.comprasService
          .registrarCompra(itemsHistorial, this.subtotal(), this.iva(), this.total())
          .subscribe({
            next: () => {
              setTimeout(() => this.router.navigate(['/catalogo']), 5000);
              setTimeout(() => this.carritoService.vaciar(),5000);
            },
            error: (err) => {
              console.error('Error registrando compra:', err);
              setTimeout(() => this.router.navigate(['/catalogo']), 5000);
              setTimeout(() => this.carritoService.vaciar(),5000);
            },
          });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Error al capturar el pago: ' + err.message);
        console.error('Error capturando pago:', err);
      },
    });
  }

  private renderPaypalButton() {
    const container = this.paypalButtonContainer?.nativeElement;

    if (!container) {
      return;
    }

    if (!window.paypal) {
      this.error.set('No se pudo cargar el SDK de PayPal.');
      return;
    }

    container.innerHTML = '';

    window.paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },
        createOrder: () => this.orderId() ?? '',
        onApprove: () => this.capturarOrden(),
        onError: (err: any) => {
          this.error.set('Error en el botón de PayPal');
          console.error('PayPal Buttons error:', err);
        },
      })
      .render(container);

    this.paypalButtonRendered = true;
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  volver() {
    this.router.navigate(['/carrito']);
  }
}
