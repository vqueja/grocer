import { HomeComponent } from './home.component';

export const HomeRoutes = [
  // { path: '', redirectTo: 'store', pathMatch: 'full' },
  { path: 'stores', component: HomeComponent },
  { path: 'stores/:slug', component: HomeComponent },
  { path: 'item/:id', component: HomeComponent },
  { path: 'item/:id/:string', component: HomeComponent }
];
