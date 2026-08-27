import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Catalog } from './catalog/catalog';
import { Detail } from './detail/detail';

const routes: Routes = [
  { path: 'catalog', component: Catalog },
  { path: 'product/:url', component: Detail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule {}
