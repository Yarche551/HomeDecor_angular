import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductType } from '../../../../types/product.type';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CountSelector } from '../count-selector/count-selector';
import { CartService } from '../../services/cart';
import { FavoriteService } from '../../services/favorite';
import { Auth } from '../../../core/auth/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'product-card',
  imports: [RouterLink, FormsModule, CountSelector],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ProductCard {
  @Input() product!: ProductType;

  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);
  authService = inject(Auth);
  private _snackBar = inject(MatSnackBar);

  serverStaticPath = environment.serverStaticPath;

  /** локальное количество, пока товара нет в корзине */
  count: number = 1;

  get countInCart(): number {
    return this.product ? this.cartService.getQuantity(this.product.id) : 0;
  }

  get isInCart(): boolean {
    return this.countInCart > 0;
  }

  get isInFavorite(): boolean {
    return this.product ? this.favoriteService.isFavorite(this.product.id) : false;
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.isInCart) {
      this.cartService.updateCart(this.product.id, value).subscribe({
        error: () => this._snackBar.open('Не удалось обновить корзину'),
      });
    }
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count).subscribe({
      next: () => this._snackBar.open('Товар добавлен в корзину'),
      error: () => this._snackBar.open('Не удалось добавить товар в корзину'),
    });
  }

  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0).subscribe({
      next: () => {
        this.count = 1;
        this._snackBar.open('Товар удален из корзины');
      },
      error: () => this._snackBar.open('Не удалось удалить товар из корзины'),
    });
  }

  toggleFavorite(): void {
    if (!this.authService.getIsLoggedIn()) {
      return;
    }

    if (this.isInFavorite) {
      this.favoriteService.removeFavorite(this.product.id).subscribe({
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
      return;
    }

    this.favoriteService.addFavorite(this.product.id).subscribe({
      next: (data) => {
        if ((data as DefaultResponseType).error !== undefined) {
          this._snackBar.open((data as DefaultResponseType).message);
          return;
        }
        this._snackBar.open('Товар добавлен в избранное');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this._snackBar.open(errorResponse.error?.message ?? 'Ошибка при добавлении в избранное');
      },
    });
  }
}
