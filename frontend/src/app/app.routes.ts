import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalogo';
import { Carrito } from './components/carrito/carrito';
import { Principal } from './components/principal/principal';
import { Check } from './components/check/check';

export const routes: Routes = [
  { path: '', component: Principal },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito', component: Carrito },
  { path: 'checkout', component: Check },
  { path: '**', redirectTo: '' },
];
