import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { CarouselModule } from 'ngx-owl-carousel-o';

@NgModule({
  declarations: [],
  imports: [CommonModule, ProductRoutingModule, SharedModule, CarouselModule],
})
export class ProductModule {}
