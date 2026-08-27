import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth } from './auth';

/**
 * Пускает на страницу только авторизованных пользователей.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.getIsLoggedIn()) {
    return true;
  }

  snackBar.open('Для доступа к этой странице необходимо авторизоваться');
  return router.createUrlTree(['/login']);
};
