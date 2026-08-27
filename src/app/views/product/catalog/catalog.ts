import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { ProductService } from '../../../shared/services/product';
import { ProductType } from '../../../../types/product.type';
import { Category } from '../../../shared/services/category';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';
import { CategoryFilter } from '../../../shared/components/category-filter/category-filter';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveParamsUtil } from '../../../shared/utils/active-params.util';
import { ActiveParamsType } from '../../../../types/active-params.type';
import { AppliedFilterType } from '../../../../types/applied-filter.type';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-catalog',
  imports: [ProductCard, CategoryFilter],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Catalog implements OnInit {
  categoryService = inject(Category);
  activatedRoute = inject(ActivatedRoute);
  productService = inject(ProductService);
  router = inject(Router);
  private elementRef = inject(ElementRef);
  products: ProductType[] = [];
  categoriesWithTypes: CategoryWithTypeType[] = [];
  activeParams: ActiveParamsType = { types: [] };
  appliedFilters: AppliedFilterType[] = [];
  sortingOpen = false;
  sortingOptions: { name: string; value: string }[] = [
    { name: 'От А до Я', value: 'az-asc' },
    { name: 'От Я до А', value: 'az-desc' },
    { name: 'По возрастанию цены', value: 'price-asc' },
    { name: 'По убыванию цены', value: 'price-desc' },
  ];
  pages: number[] = [];

  constructor() {}

  ngOnInit(): void {
    this.categoryService.getCategoriesWithTypes().subscribe((data) => {
      this.categoriesWithTypes = data;

      this.activatedRoute.queryParams
        .pipe(
          debounceTime(500),  // debounce, чтоб колбек не срабатыва при малейшем изменении
        )
        .subscribe((params) => {
        this.activeParams = ActiveParamsUtil.processParams(params);

        this.appliedFilters = [];
        this.activeParams.types.forEach((url) => {
          for (let i = 0; i < this.categoriesWithTypes.length; i++) {
            const foundtype = this.categoriesWithTypes[i].types.find((type) => type.url === url);
            if (foundtype) {
              this.appliedFilters.push({
                name: foundtype.name,
                urlParam: foundtype.url,
              });
            }
          }
        });

        // высота
        if (this.activeParams.heightFrom) {
          this.appliedFilters.push({
            name: 'Высота: от ' + this.activeParams.heightFrom + ' см',
            urlParam: 'heightFrom',
          });
        }
        if (this.activeParams.heightTo) {
          this.appliedFilters.push({
            name: 'Высота: до ' + this.activeParams.heightTo + ' см',
            urlParam: 'heightTo',
          });
        }

        // диаметр
        if (this.activeParams.diameterTo) {
          this.appliedFilters.push({
            name: 'Диаметр: до ' + this.activeParams.diameterTo + ' см',
            urlParam: 'diameterTo',
          });
        }
        if (this.activeParams.diameterFrom) {
          this.appliedFilters.push({
            name: 'Диаметр: до ' + this.activeParams.diameterFrom + ' см',
            urlParam: 'diameterFrom',
          });
        }

        this.productService.getProducts(this.activeParams).subscribe((data) => {
          this.pages = [];
          for (let i = 1; i <= data.pages; i++) {
            this.pages.push(i);
          }
          this.products = data.items;
        });
      });
    });
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType) {
    if (
      appliedFilter.urlParam === 'heightTo' ||
      appliedFilter.urlParam === 'heightFrom' ||
      appliedFilter.urlParam === 'diameterTo' ||
      appliedFilter.urlParam === 'diameterFrom'
    ) {
      delete this.activeParams[appliedFilter.urlParam];
    } else {
      this.activeParams.types = this.activeParams.types.filter(
        (item) => item !== appliedFilter.urlParam,
      );
    }

    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  toggleSorting() {
    this.sortingOpen = !this.sortingOpen;
  }

  /** закрываем выпадающий список сортировки при клике вне него */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.sortingOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.sortingOpen = false;
    }
  }

  sort(value: string) {
    this.activeParams.sort = value;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  openPage(page: number) {
    this.activeParams.page = page;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams,
      });
    }
  }

  openNextPage() {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams,
      });
    }
  }
}

