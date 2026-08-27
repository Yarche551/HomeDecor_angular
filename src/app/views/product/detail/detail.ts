import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ProductType } from '../../../../types/product.type';
import { ProductService } from '../../../shared/services/product';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CountSelector } from '../../../shared/components/count-selector/count-selector';
import { CartService } from '../../../shared/services/cart';
import { FavoriteService } from '../../../shared/services/favorite';
import { Auth } from '../../../core/auth/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-detail',
  imports: [CarouselModule, ProductCard, CountSelector],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Detail implements OnInit {
  private productService = inject(ProductService);
  private activatedRoute = inject(ActivatedRoute);
  private _snackBar = inject(MatSnackBar);
  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);
  authService = inject(Auth);

  recommendedProducts: ProductType[] = [];
  count: number = 1;
  product!: ProductType;
  serverStaticPath = environment.serverStaticPath;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 4 },
    },
    nav: false,
  };

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productService.getProduct(params['url']).subscribe((data: ProductType) => {
        this.product = data;
        this.count = this.countInCart > 0 ? this.countInCart : 1;
      });
    });

    this.productService.getBestProducts().subscribe((data: ProductType[]) => {
      this.recommendedProducts = data;
    });
  }

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
