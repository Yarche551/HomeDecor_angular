import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { RouterOutlet } from '@angular/router';
import { CategoryType } from '../../../types/category.type';
import { Category } from '../services/category';
import { CategoryWithTypeType } from '../../../types/category-with-type.type';

@Component({
  selector: 'app-layout',
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './layout.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Layout implements OnInit {
  categories: CategoryWithTypeType[] = [];
  public categoryService = inject(Category);

  ngOnInit() {
    this.categoryService
      .getCategoriesWithTypes()
      .subscribe((categories: CategoryWithTypeType[]) => {
        this.categories = categories.map((item) => {
          return Object.assign({ typesUrl: item.types.map((item) => item.url) }, item);
        });
      });
  }
}
