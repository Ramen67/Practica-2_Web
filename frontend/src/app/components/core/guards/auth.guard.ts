import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

export const nonAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getUsuario()?.rol === 'admin') {
    return router.createUrlTree(['/catalogo']);
  }

  return true;
};
