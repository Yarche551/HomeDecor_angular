import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountSelector } from '../../../shared/components/count-selector/count-selector';
import { FavoriteService } from '../../../shared/services/favorite';
import { CartService } from '../../../shared/services/cart';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-favorite',
  imports: [RouterLink, CountSelector],
  templateUrl: './favorite.html',
  styleUrl: './favorite.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Favorite implements OnInit {
  favoriteService = inject(FavoriteService);
  cartService = inject(CartService);
  private _snackBar = inject(MatSnackBar);

  serverStaticPath = environment.serverStaticPath;

  ngOnInit(): void {
    this.favoriteService.loadFavorites();
    this.cartService.loadCart();
  }

  getCountInCart(productId: string): number {
    return this.cartService.getQuantity(productId);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  addToCart(productId: string): void {
    this.cartService.updateCart(productId, 1).subscribe({
      next: () => this._snackBar.open('Товар добавлен в корзину'),
      error: () => this._snackBar.open('Не удалось добавить товар в корзину'),
    });
  }

  updateCount(productId: string, count: number): void {
    this.cartService.updateCart(productId, count).subscribe({
      error: () => this._snackBar.open('Не удалось обновить корзину'),
    });
  }

  removeFromCart(productId: string): void {
    this.cartService.updateCart(productId, 0).subscribe({
      next: () => this._snackBar.open('Товар удален из корзины'),
      error: () => this._snackBar.open('Не удалось удалить товар из корзины'),
    });
  }

  removeFromFavorite(productId: string): void {
    this.favoriteService.removeFavorite(productId).subscribe({
      next: (data: DefaultResponseType) => {
        if (data.error) {
          this._snackBar.open(data.message);
          return;
        }
        this._snackBar.open('Товар удален из избранного');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this._snackBar.open(errorResponse.error?.message ?? 'Ошибка при удалении из избранного');
      },
    });
  }
}
