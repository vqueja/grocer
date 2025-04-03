import { RouterModule, Routes } from '@angular/router';
// import { CanActivateViaAuthGuard } from './core/guards/auth.guard';
import { StaticPagesComponent } from './shared/components/static-pages/static-pages.component';

export const routes: Routes = [
  // { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: '',
    loadChildren: './main/main.module#MainModule'
  },
  {
    path: 'stores',
    loadChildren: './home/index#HomeModule'
  },
  {
    path: 'checkout',
    loadChildren: './checkout/checkout.module#CheckoutModule'
  },
  {
    path: 'user',
    loadChildren: './user/index#UserModule'
  },
  {
    path: 'item',
    loadChildren: './product/index#ProductModule'
  },
  {
    path: 'auth',
    loadChildren: './auth/auth.module#AuthModule'
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule'
  },
  { path: 'vision', component: StaticPagesComponent },
  { path: 'team', component: StaticPagesComponent },
  { path: 'careers', component: StaticPagesComponent },
  { path: 'faq', component: StaticPagesComponent },
  { path: 'suggest', component: StaticPagesComponent },
  { path: 'privacy', component: StaticPagesComponent },
  { path: 'terms', component: StaticPagesComponent },
  { path: 'contact', component: StaticPagesComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];
