import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Произошла ошибка';

      if (error.error instanceof ErrorEvent) {
        // ❌ Ошибка на стороне клиента
        errorMessage = `Ошибка: ${error.error.message}`;
      } else {
        // ❌ Ошибка на стороне сервера
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Неверные данные';
            break;
          case 401:
            errorMessage = 'Неверный логин или пароль';
            authService.logout(); // Разлогинить пользователя
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Доступ запрещен';
            break;
          case 404:
            errorMessage = error.error?.message || 'Ресурс не найден';
            break;
          case 500:
            errorMessage = 'Внутренняя ошибка сервера';
            break;
          default:
            errorMessage = `Ошибка ${error.status}: ${error.message}`;
        }
      }

      console.error('HTTP Error:', errorMessage, error);
      
      // Возвращаем ошибку для обработки в компонентах
      return throwError(() => ({ message: errorMessage, originalError: error }));
    })
  );
};