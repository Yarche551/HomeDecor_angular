import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/auth/auth';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { CartService } from '../../services/cart';
import { FavoriteService } from '../../services/favorite';
import { ProductService } from '../../services/product';
import { ProductType } from '../../../../types/product.type';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatMenuTrigger, MatMenuItem, MatMenu, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Header {
  authService = inject(Auth);
  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);
  private productService = inject(ProductService);
  private _snackBar = inject(MatSnackBar);
  private elementRef = inject(ElementRef);

  @Input() categories: CategoryWithTypeType[] = [];

  serverStaticPath = environment.serverStaticPath;

  searchValue: string = '';
  showedSearch: boolean = false;
  products: ProductType[] = [];
  private searchSubject: Subject<string> = new Subject<string>();

  constructor(public router: Router) {
    this.searchSubject.pipe(debounceTime(500)).subscribe((value: string) => {
      this.processSearch(value);
    });
  }

  changedSearchValue(value: string): void {
    this.searchValue = value;
    this.searchSubject.next(value);
  }

  private processSearch(value: string): void {
    if (!value || !value.trim()) {
      this.products = [];
      this.showedSearch = false;
      return;
    }

    this.productService.searchProducts(value.trim()).subscribe({
      next: (data: ProductType[]) => {
        this.products = data;
        this.showedSearch = true;
      },
      error: () => {
        this.products = [];
        this.showedSearch = false;
      },
    });
  }

  selectProduct(url: string): void {
    this.router.navigate(['/product/' + url]);
    this.searchValue = '';
    this.products = [];
    this.showedSearch = false;
  }

  /** закрываем выпадающий список при клике вне шапки */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showedSearch && !this.elementRef.nativeElement.contains(event.target)) {
      this.showedSearch = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.doLogout(),
      error: (errorResponse: HttpErrorResponse) => this.doLogout(),
    });
  }

  // если refresh-токен истек — пользователь даже не выйдет,
  // поэтому чистим данные в любом случае
  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }
}
