import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true; // Пользователь - администратор
  } else {
    // Редирект на главную или показать ошибку 403
    console.warn('Access denied: Admin role required');
    router.navigate(['/login']);
    return false;
  }
};
