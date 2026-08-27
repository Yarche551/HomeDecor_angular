import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profile } from './profile/profile';
import { Orders } from './orders/orders';
import { Favorite } from './favorite/favorite';
import { authGuard } from '../../core/auth/auth.guard';

const routes: Routes = [
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'orders', component: Orders, canActivate: [authGuard] },
  { path: 'favorite', component: Favorite, canActivate: [authGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalRoutingModule {}
