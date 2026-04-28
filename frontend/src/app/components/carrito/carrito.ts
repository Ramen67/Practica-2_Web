import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { Signal } from '@angular/core';
import { CartItem } from '../../models/carrito-item.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  private router = inject(Router);
  private carritoService = inject(CarritoService);

  carrito: Signal<CartItem[]>;
  total = computed(() => this.carritoService.total());

  constructor() {
    this.carrito = this.carritoService.items;
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  aumentar(id: number) {
    this.carritoService.aumentarCantidad(id);
  }

  disminuir(id: number) {
    this.carritoService.disminuirCantidad(id);
  }

  puedeAumentar(id: number) {
    return this.carritoService.puedeAumentar(id);
  }

  stockDisponible(id: number) {
    return this.carritoService.stockDisponible(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }

  irACheckout() {
    this.router.navigate(['/checkout']);
  }
}
