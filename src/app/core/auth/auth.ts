import { inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, shareReplay, Subject, throwError } from 'rxjs';
import { DefaultResponseType } from '../../../types/default-response.type';
import { LoginResponseType } from '../../../types/login-response.type';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Auth {
  public accessTokenKey: string = 'accessToken';
  public refreshTokenKey: string = 'refreshToken';
  public userIdKey: string = 'userId';

  /**
   * Реактивное состояние авторизации.
   * Компоненты читают его напрямую в шаблонах: authService.isLoggedSig()
   */
  public isLoggedSig = signal(false);

  /**
   * Поток событий логина/логаута для сервисов,
   * которым нужно перезагрузить свои данные (корзина, избранное).
   */
  public isLogged$: Subject<boolean> = new Subject<boolean>();

  public http = inject(HttpClient);

  /** текущий (общий) запрос на обновление токенов */
  private refreshRequest$: Observable<LoginResponseType> | null = null;

  constructor() {
    this.isLoggedSig.set(!!localStorage.getItem(this.accessTokenKey));
  }

  login(
    email: string,
    password: string,
    rememberMe: boolean,
  ): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email,
      password,
      rememberMe,
    });
  }

  signup(
    email: string,
    password: string,
    passwordRepeat: string,
  ): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      email,
      password,
      passwordRepeat,
    });
  }

  logout(): Observable<DefaultResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.http.post<DefaultResponseType>(environment.api + 'logout', {
        refreshToken: tokens.refreshToken,
      });
    }
    return throwError(() => 'Can not find token');
  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {
        refreshToken: tokens.refreshToken,
      });
    }
    return throwError(() => 'Can not use token');
  }

  /**
   * Обновление пары токенов. Бэкенд хранит один refresh-токен на пользователя
   * и меняет его при каждом обновлении, поэтому параллельные запросы должны
   * использовать один и тот же запрос на обновление, иначе второй "протухнет".
   */
  refreshTokens(): Observable<LoginResponseType> {
    if (!this.refreshRequest$) {
      this.refreshRequest$ = this.refresh().pipe(
        map((result: DefaultResponseType | LoginResponseType) => {
          if ((result as DefaultResponseType).error !== undefined) {
            throw new Error((result as DefaultResponseType).message);
          }

          const loginResponse = result as LoginResponseType;
          if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
            throw new Error('Ошибка авторизации');
          }

          this.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
          this.userId = loginResponse.userId;
          return loginResponse;
        }),
        // finalize до shareReplay: сбрасываем общий запрос ровно один раз —
        // когда обновление действительно завершилось
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.refreshRequest$;
  }

  public getIsLoggedIn(): boolean {
    return this.isLoggedSig();
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLoggedSig.set(true);
    this.isLogged$.next(true);
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLoggedSig.set(false);
    this.isLogged$.next(false);
  }

  public getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey),
    };
  }

  get userId(): null | string {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(id: string | null) {
    if (id) {
      localStorage.setItem(this.userIdKey, id);
    } else {
      localStorage.removeItem(this.userIdKey);
    }
  }
}
