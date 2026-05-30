import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalogo';
import { Carrito } from './components/carrito/carrito';
import { Principal } from './components/principal/principal';
import { Check } from './components/check/check';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Profile } from './components/user/profile/profile';
import { History } from './components/user/history/history';
import { AdminProductos } from './components/admin/productos-admin/productos-admin';
import { nonAdminGuard } from './components/core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {path: 'principal', component: Principal},
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito', component: Carrito, canActivate: [nonAdminGuard] },
  { path: 'checkout', component: Check, canActivate: [nonAdminGuard] },
  { path: 'profile', component: Profile },
  { path: 'history', component: History, canActivate: [nonAdminGuard] },
  { path: 'admin-productos', component: AdminProductos },
  { path: '**', redirectTo: 'login' },
];
