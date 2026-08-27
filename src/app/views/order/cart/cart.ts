import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CountSelector } from '../../../shared/components/count-selector/count-selector';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { CartService } from '../../../shared/services/cart';
import { ProductService } from '../../../shared/services/product';
import { ProductType } from '../../../../types/product.type';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CarouselModule, CountSelector, ProductCard],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Cart implements OnInit {
  cartService = inject(CartService);
  private productService = inject(ProductService);
  private _snackBar = inject(MatSnackBar);

  serverStaticPath = environment.serverStaticPath;
  extraProducts: ProductType[] = [];

  /** общая стоимость товаров в корзине */
  totalAmount = computed(() =>
    this.cartService.cart().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );

  /** общее количество товаров в корзине */
  totalCount = computed(() => this.cartService.count());

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
    // корзина могла измениться в другой вкладке — перечитываем при входе на страницу
    this.cartService.loadCart();

    this.productService.getBestProducts().subscribe((data: ProductType[]) => {
      this.extraProducts = data;
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
}
