import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProdUsersComponent } from './prod-users/prod-users.component';
import { NonProdUsersComponent } from './non-prod-users/non-prod-users.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'produsers', component: ProdUsersComponent },
  { path: 'nonprodusers', component: NonProdUsersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
