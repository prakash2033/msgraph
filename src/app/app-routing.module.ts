import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProdUsersComponent } from './prod-users/prod-users.component';
import { NonProdUsersComponent } from './non-prod-users/non-prod-users.component';
import { RestrictedComponent } from './restricted/restricted.component';
import { AuthenticationGuardProd } from './authProd.guard';
import { AuthenticationGuardNonProd } from './authNonProd.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'produsers',
    component: ProdUsersComponent,
    canActivate: [AuthenticationGuardProd],
  },
  {
    path: 'nonprodusers',
    component: NonProdUsersComponent,
    canActivate: [AuthenticationGuardProd],
  },
  {
    path: 'restricted',
    component: RestrictedComponent,
    canActivate: [AuthenticationGuardProd, AuthenticationGuardNonProd],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
