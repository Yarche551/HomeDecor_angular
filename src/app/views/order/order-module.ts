import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, OrderRoutingModule, SharedModule, CarouselModule, ReactiveFormsModule],
})
export class OrderModule {}
