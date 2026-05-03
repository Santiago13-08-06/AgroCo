import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Redirige a /admin si es admin; usuarios sin sesión ven la landing page.
export const adminHomeRedirectGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.ensureUser();

  if (user?.is_admin) return router.parseUrl('/admin');
  return true;
};
