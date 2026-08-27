import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';
import { Main } from './views/main/main';
import { NotFound } from './views/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Main },
      {
        path: '',
        loadChildren: () => import('./views/user/user-module').then((m) => m.UserModule),
      },
      {
        path: '',
        loadChildren: () => import('./views/product/product-module').then((m) => m.ProductModule),
      },
      {
        path: '',
        loadChildren: () => import('./views/order/order-module').then((m) => m.OrderModule),
      },
      {
        path: '',
        loadChildren: () =>
          import('./views/personal/personal-module').then((m) => m.PersonalModule),
      },
      { path: '**', component: NotFound },
    ],
  },
];
