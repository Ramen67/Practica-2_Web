import { Component, OnDestroy, OnInit, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isLoggedIn = false;
  usuario: any = null;
  private platformId = inject(PLATFORM_ID);
  private routerEventsSubscription?: Subscription;
  tieneProductosEnCarrito = computed(() => this.carritoService.items().length > 0);
  iconoCarrito = computed(() =>
    this.tieneProductosEnCarrito() ? '/carrito%20lleno.png' : '/carrito.png',
  );

  constructor(
    private authService: AuthService,
    private router: Router,
    private carritoService: CarritoService,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.syncUserState();
      this.routerEventsSubscription = this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => this.syncUserState());
    }
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
  }

  private syncUserState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.usuario = this.authService.getUsuario();
  }

  isAdmin(): boolean {
    return this.usuario?.rol === 'admin';
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.usuario = null;
    this.router.navigate(['/login']);
  }
}
