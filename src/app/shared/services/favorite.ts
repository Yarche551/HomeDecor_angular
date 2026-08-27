import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FavoriteType } from '../../../types/favorite.type';
import { DefaultResponseType } from '../../../types/default-response.type';
import { Auth } from '../../core/auth/auth';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private authService = inject(Auth);

  /** Избранное доступно только авторизованным пользователям */
  readonly favorites = signal<FavoriteType[]>([]);

  constructor() {
    this.loadFavorites();
    this.authService.isLogged$.subscribe(() => this.loadFavorites());
  }

  loadFavorites(): void {
    if (!this.authService.getIsLoggedIn()) {
      this.favorites.set([]);
      return;
    }
    this.requestFavorites().subscribe({
      next: (data) => {
        if (!(data as DefaultResponseType).error) {
          this.favorites.set(data as FavoriteType[]);
        }
      },
      error: () => this.favorites.set([]),
    });
  }

  requestFavorites(): Observable<FavoriteType[] | DefaultResponseType> {
    return this.http.get<FavoriteType[] | DefaultResponseType>(environment.api + 'favorites');
  }

  addFavorite(productId: string): Observable<FavoriteType | DefaultResponseType> {
    return this.http
      .post<FavoriteType | DefaultResponseType>(environment.api + 'favorites', { productId })
      .pipe(
        tap((data) => {
          if (!(data as DefaultResponseType).error) {
            this.favorites.update((items) => [...items, data as FavoriteType]);
          }
        }),
      );
  }

  removeFavorite(productId: string): Observable<DefaultResponseType> {
    return this.http
      .delete<DefaultResponseType>(environment.api + 'favorites', { body: { productId } })
      .pipe(
        tap(() => {
          this.favorites.update((items) => items.filter((item) => item.id !== productId));
        }),
      );
  }

  isFavorite(productId: string): boolean {
    return this.favorites().some((item) => item.id === productId);
  }
}
