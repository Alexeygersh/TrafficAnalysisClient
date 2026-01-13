import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Пользователь авторизован
  } else {
    // Редирект на страницу входа
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url } // Сохраняем URL для возврата
    });
    return false;
  }
};
