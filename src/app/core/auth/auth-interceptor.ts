import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { Auth } from './auth';
import { LoginResponseType } from '../../../types/login-response.type';

/**
 * Ко всем запросам добавляем:
 *  - withCredentials, чтобы работала сессионная корзина неавторизованного пользователя;
 *  - заголовок x-access-token, если пользователь залогинен.
 * Если сервер ответил, что токен протух — обновляем пару токенов и повторяем запрос.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const tokens = authService.getTokens();
  let authReq = req.clone({ withCredentials: true });

  if (tokens && tokens.accessToken) {
    authReq = authReq.clone({
      headers: authReq.headers.set('x-access-token', tokens.accessToken),
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      const isAuthRequest = req.url.includes('/login') || req.url.includes('/signup') || req.url.includes('/refresh');

      if (!isAuthRequest && isTokenError(error) && authService.getTokens().refreshToken) {
        return refreshAndRetry(authReq, next, authService, router);
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Бэкенд отдает ошибку авторизации как 401, а при протухшем токене —
 * как 500 с сообщением от passport/jwt, поэтому проверяем оба варианта.
 */
function isTokenError(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  if (error.status === 401) {
    return true;
  }
  const message: string = error.error?.message ?? '';
  return error.status === 500 && /jwt|token|токен|unauthorized/i.test(message);
}

function refreshAndRetry(
  req: HttpRequest<unknown>,
  next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
  authService: Auth,
  router: Router,
): Observable<HttpEvent<unknown>> {
  return authService.refreshTokens().pipe(
    catchError((error) => {
      // обновить токены не удалось — разлогиниваем пользователя
      authService.removeTokens();
      authService.userId = null;
      router.navigate(['/login']);
      return throwError(() => error);
    }),
    switchMap((refreshResult: LoginResponseType) =>
      next(req.clone({ headers: req.headers.set('x-access-token', refreshResult.accessToken) })),
    ),
  );
}
