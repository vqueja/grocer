import { CanActivateViaAuthGuard } from './../core/guards/auth.guard';
import { UserComponent } from './user.component';
import { OrdersComponent } from './components/orders/orders.component';
import { AddressesComponent } from './components/addresses/addresses.component';
import { AddressEditComponent } from './components/addresses/address-edit/address-edit.component';
import { OrderDetailComponent } from './components/orders/order-detail/order-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ListsComponent } from './components/lists/lists.component';
import { ListDetailComponent } from './components/lists/list-detail/list-detail.component';
import { ResetPassComponent } from './components/reset-pass/reset-pass.component';

export const UserRoutes = [
  {
    path: 'guestActivation',
    component: ResetPassComponent
  },
  {
    path: 'resetPassword',
    component: ResetPassComponent
  },
  {
    path: '',
    component: UserComponent,
    canActivate: [ CanActivateViaAuthGuard ],
    children: [
      { path: '', redirectTo: 'profile' },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/detail/:orderkey', component: OrderDetailComponent },
      { path: 'address', component: AddressesComponent },
      { path: 'address/add/:type', component: AddressEditComponent},
      { path: 'address/edit/:id', component: AddressEditComponent},
      { path: 'lists', component: ListsComponent },
      { path: 'lists/detail/:userId/:id', component: ListDetailComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'passwordReset', component: ResetPassComponent }
    ]
  },
];
