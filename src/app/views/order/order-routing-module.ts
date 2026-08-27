import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Cart } from './cart/cart';
import { Order } from './order/order';

const routes: Routes = [
  { path: 'cart', component: Cart },
  { path: 'order', component: Order },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
