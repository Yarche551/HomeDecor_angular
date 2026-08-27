import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartCountType, CartType } from '../../../types/cart.type';
import { DefaultResponseType } from '../../../types/default-response.type';
import { Auth } from '../../core/auth/auth';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(Auth);

  /** Текущее состояние корзины — единый источник правды для всех компонентов */
  readonly cart = signal<CartType>({ items: [] });

  /** Общее количество товаров — для счетчика в шапке */
  readonly count = computed(() =>
    this.cart().items.reduce((total, item) => total + item.quantity, 0),
  );

  constructor() {
    this.loadCart();
    // после логина/логаута корзина на бэкенде другая — перечитываем
    this.authService.isLogged$.subscribe(() => this.loadCart());
  }

  loadCart(): void {
    this.requestCart().subscribe({
      next: (data) => {
        if (!(data as DefaultResponseType).error) {
          this.cart.set(data as CartType);
        }
      },
      error: () => this.cart.set({ items: [] }),
    });
  }

  requestCart(): Observable<CartType | DefaultResponseType> {
    return this.http.get<CartType | DefaultResponseType>(environment.api + 'cart');
  }

  getCartCount(): Observable<CartCountType | DefaultResponseType> {
    return this.http.get<CartCountType | DefaultResponseType>(environment.api + 'cart/count');
  }

  /**
   * Обновляет количество товара в корзине.
   * quantity = 0 удаляет товар из корзины.
   */
  updateCart(productId: string, quantity: number): Observable<CartType | DefaultResponseType> {
    return this.http
      .post<CartType | DefaultResponseType>(environment.api + 'cart', { productId, quantity })
      .pipe(
        tap((data) => {
          if (!(data as DefaultResponseType).error) {
            this.cart.set(data as CartType);
          }
        }),
      );
  }

  clearCart(): Observable<DefaultResponseType> {
    return this.http
      .delete<DefaultResponseType>(environment.api + 'cart')
      .pipe(tap(() => this.cart.set({ items: [] })));
  }

  /** Количество конкретного товара в корзине (0 — товара в корзине нет) */
  getQuantity(productId: string): number {
    const item = this.cart().items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  isInCart(productId: string): boolean {
    return this.getQuantity(productId) > 0;
  }
}
