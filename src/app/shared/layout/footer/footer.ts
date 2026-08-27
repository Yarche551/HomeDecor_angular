import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CategoryType } from '../../../../types/category.type';
import { RouterLink } from '@angular/router';
import { CategoryWithTypeType } from '../../../../types/category-with-type.type';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Footer implements OnInit {
  @Input() categories: CategoryWithTypeType[] = [];

  constructor() {}

  ngOnInit() {}
}
